use axum::{extract::State, Json};
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::error::{ApiError, ApiResult};
use crate::models::EmailSignup;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct SubscribeRequest {
    pub email: String,
}

#[derive(Serialize)]
pub struct SubscribeResponse {
    pub ok: bool,
}

fn is_valid_email(email: &str) -> bool {
    let email = email.trim();
    let Some((local, domain)) = email.split_once('@') else {
        return false;
    };
    !local.is_empty() && !domain.is_empty() && domain.contains('.')
}

/// POST /email/subscribe — capture email for release list (requires MongoDB).
pub async fn subscribe(
    State(state): State<AppState>,
    Json(body): Json<SubscribeRequest>,
) -> ApiResult<Json<SubscribeResponse>> {
    let db = state.require_db()?;

    let email = body.email.trim().to_lowercase();
    if !is_valid_email(&email) {
        return Err(ApiError::BadRequest("invalid email".into()));
    }

    let existing = db
        .emails()
        .find_one(doc! { "email": &email })
        .await
        .map_err(|e| ApiError::Internal(e.to_string()))?;

    if existing.is_none() {
        let signup = EmailSignup {
            email,
            created_at: OffsetDateTime::now_utc(),
        };
        db.emails()
            .insert_one(&signup)
            .await
            .map_err(|e| ApiError::Internal(e.to_string()))?;
    }

    // Always return ok — don't leak whether email was already registered.
    Ok(Json(SubscribeResponse { ok: true }))
}
