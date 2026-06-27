pub mod cookie;

use axum::{
    extract::FromRequestParts,
    http::{header::COOKIE, request::Parts},
};

use crate::auth::cookie::{verify_gate2_cookie, GATE2_COOKIE_NAME};
use crate::error::ApiError;
use crate::state::AppState;

/// Extractor for routes that require a valid gate2 signed cookie.
pub struct Gate2Session;

impl FromRequestParts<AppState> for Gate2Session {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let cookie_header = parts
            .headers
            .get(COOKIE)
            .and_then(|v| v.to_str().ok())
            .ok_or(ApiError::Unauthorized)?;

        let value = parse_cookie(cookie_header, GATE2_COOKIE_NAME)
            .ok_or(ApiError::Unauthorized)?;

        verify_gate2_cookie(&state.config, value).map_err(|_| ApiError::Unauthorized)?;

        Ok(Gate2Session)
    }
}

fn parse_cookie<'a>(header: &'a str, name: &str) -> Option<&'a str> {
    header.split(';').find_map(|pair| {
        let (k, v) = pair.trim().split_once('=')?;
        if k == name { Some(v) } else { None }
    })
}
