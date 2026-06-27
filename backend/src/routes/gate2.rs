use axum::{
    extract::State,
    http::{header::{COOKIE, SET_COOKIE}, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};

use crate::auth::cookie::{
    format_set_cookie_header, issue_gate2_cookie, verify_gate2_cookie, GATE2_COOKIE_NAME,
};
use crate::error::ApiResult;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct VerifyRequest {
    pub answer: String,
}

#[derive(Serialize)]
pub struct VerifyResponse {
    pub ok: bool,
}

#[derive(Serialize)]
pub struct StatusResponse {
    pub gate2: bool,
}

/// POST /gate2/verify — check puzzle answer, set signed HttpOnly cookie on success.
pub async fn verify(
    State(state): State<AppState>,
    Json(body): Json<VerifyRequest>,
) -> ApiResult<Response> {
    let answer = body.answer.trim();
    if answer.is_empty() {
        return Err(crate::error::ApiError::BadRequest("answer is required".into()));
    }

    if answer != state.config.gate2_answer {
        return Err(crate::error::ApiError::Unauthorized);
    }

    let cookie_value =
        issue_gate2_cookie(&state.config).map_err(crate::error::ApiError::Internal)?;
    let set_cookie = format_set_cookie_header(&state.config, &cookie_value);

    Ok((
        StatusCode::OK,
        [(SET_COOKIE, set_cookie)],
        Json(VerifyResponse { ok: true }),
    )
        .into_response())
}

/// GET /gate2/status — check whether the browser already has a valid gate2 cookie.
pub async fn status(State(state): State<AppState>, headers: axum::http::HeaderMap) -> Json<StatusResponse> {
    let valid = headers
        .get(COOKIE)
        .and_then(|v| v.to_str().ok())
        .and_then(|h| parse_cookie(h, GATE2_COOKIE_NAME))
        .and_then(|v| verify_gate2_cookie(&state.config, v).ok())
        .is_some();

    Json(StatusResponse { gate2: valid })
}

fn parse_cookie<'a>(header: &'a str, name: &str) -> Option<&'a str> {
    header.split(';').find_map(|pair| {
        let (k, v) = pair.trim().split_once('=')?;
        if k == name { Some(v) } else { None }
    })
}
