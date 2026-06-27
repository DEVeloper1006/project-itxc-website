use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use subtle::ConstantTimeEq;
use time::{Duration, OffsetDateTime};

use crate::config::Config;

pub const GATE2_COOKIE_NAME: &str = "gate2";

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Serialize, Deserialize)]
pub struct Gate2Payload {
    pub gate2: bool,
    #[serde(with = "time::serde::timestamp")]
    pub exp: OffsetDateTime,
}

pub fn issue_gate2_cookie(config: &Config) -> Result<String, String> {
    let exp = OffsetDateTime::now_utc() + Duration::seconds(config.cookie_ttl.as_secs() as i64);
    let payload = Gate2Payload { gate2: true, exp };
    sign_payload(&config.cookie_secret, &payload)
}

pub fn verify_gate2_cookie(config: &Config, cookie_value: &str) -> Result<(), String> {
    let payload = verify_and_decode(&config.cookie_secret, cookie_value)?;

    if !payload.gate2 {
        return Err("invalid gate2 claim".into());
    }
    if payload.exp < OffsetDateTime::now_utc() {
        return Err("cookie expired".into());
    }

    Ok(())
}

pub fn format_set_cookie_header(config: &Config, value: &str) -> String {
    let mut parts = vec![
        format!("{GATE2_COOKIE_NAME}={value}"),
        "HttpOnly".into(),
        format!("Max-Age={}", config.cookie_ttl.as_secs()),
        "Path=/".into(),
        "SameSite=Lax".into(),
    ];

    if config.cookie_secure {
        parts.push("Secure".into());
    }

    parts.join("; ")
}

fn sign_payload(secret: &[u8], payload: &Gate2Payload) -> Result<String, String> {
    let payload_json =
        serde_json::to_string(payload).map_err(|e| format!("serialize payload: {e}"))?;
    let payload_b64 = URL_SAFE_NO_PAD.encode(payload_json.as_bytes());
    let signature = compute_hmac(secret, payload_b64.as_bytes())?;
    Ok(format!("{payload_b64}.{signature}"))
}

fn verify_and_decode(secret: &[u8], cookie_value: &str) -> Result<Gate2Payload, String> {
    let (payload_b64, sig_b64) = cookie_value
        .rsplit_once('.')
        .ok_or_else(|| "malformed cookie".to_string())?;

    let expected_sig = compute_hmac(secret, payload_b64.as_bytes())?;
    let actual_sig = sig_b64.to_string();

    if expected_sig.as_bytes().ct_eq(actual_sig.as_bytes()).unwrap_u8() != 1 {
        return Err("invalid signature".into());
    }

    let payload_bytes = URL_SAFE_NO_PAD
        .decode(payload_b64)
        .map_err(|_| "invalid payload encoding".to_string())?;
    serde_json::from_slice(&payload_bytes).map_err(|_| "invalid payload json".to_string())
}

fn compute_hmac(secret: &[u8], data: &[u8]) -> Result<String, String> {
    let mut mac = HmacSha256::new_from_slice(secret).map_err(|e| format!("hmac key: {e}"))?;
    mac.update(data);
    Ok(URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    fn test_config() -> Config {
        Config {
            host: "127.0.0.1".into(),
            port: 8080,
            cookie_secret: b"test-secret-key-32-bytes-long!!".to_vec(),
            gate2_answer: "answer".into(),
            cookie_ttl: Duration::from_secs(3600),
            cookie_secure: false,
            allowed_origins: vec!["http://localhost:3000".into()],
            mongodb_uri: None,
            mongodb_db: "itxc".into(),
        }
    }

    #[test]
    fn round_trip_cookie() {
        let config = test_config();
        let cookie = issue_gate2_cookie(&config).unwrap();
        verify_gate2_cookie(&config, &cookie).unwrap();
    }

    #[test]
    fn tampered_cookie_rejected() {
        let config = test_config();
        let mut cookie = issue_gate2_cookie(&config).unwrap();
        cookie.push('x');
        assert!(verify_gate2_cookie(&config, &cookie).is_err());
    }
}
