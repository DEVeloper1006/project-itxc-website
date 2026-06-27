use std::env;
use std::time::Duration;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub cookie_secret: Vec<u8>,
    pub gate2_answer: String,
    pub cookie_ttl: Duration,
    pub cookie_secure: bool,
    pub allowed_origins: Vec<String>,
    pub mongodb_uri: Option<String>,
    pub mongodb_db: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let cookie_secret = env::var("COOKIE_SECRET")
            .map_err(|_| "COOKIE_SECRET is required".to_string())?;
        if cookie_secret.len() < 16 {
            return Err("COOKIE_SECRET must be at least 16 characters".into());
        }

        let gate2_answer = env::var("GATE2_ANSWER")
            .map_err(|_| "GATE2_ANSWER is required".to_string())?;

        let ttl_hours: u64 = env::var("COOKIE_TTL_HOURS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(24);

        Ok(Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(8080),
            cookie_secret: cookie_secret.into_bytes(),
            gate2_answer,
            cookie_ttl: Duration::from_secs(ttl_hours * 3600),
            cookie_secure: env::var("COOKIE_SECURE")
                .map(|v| v == "true" || v == "1")
                .unwrap_or(false),
            allowed_origins: env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".into())
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            mongodb_uri: env::var("MONGODB_URI").ok().filter(|s| !s.is_empty()),
            mongodb_db: env::var("MONGODB_DB").unwrap_or_else(|_| "itxc".into()),
        })
    }
}
