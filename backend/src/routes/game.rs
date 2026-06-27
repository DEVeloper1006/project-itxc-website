use axum::{extract::State, Json};
use futures::TryStreamExt;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::auth::Gate2Session;
use crate::error::{ApiError, ApiResult};
use crate::models::HighScore;
use crate::state::AppState;

const LEADERBOARD_LIMIT: i64 = 10;
const MAX_INITIALS_LEN: usize = 4;
const MAX_SCORE: u64 = 9_999_999;

#[derive(Deserialize)]
pub struct SubmitScoreRequest {
    pub initials: String,
    pub score: u64,
}

#[derive(Serialize)]
pub struct SubmitScoreResponse {
    pub ok: bool,
    pub rank: Option<u64>,
}

#[derive(Serialize)]
pub struct LeaderboardResponse {
    pub scores: Vec<HighScore>,
}

/// POST /game/score — save a high score (requires gate2 cookie + MongoDB).
pub async fn submit_score(
    _session: Gate2Session,
    State(state): State<AppState>,
    Json(body): Json<SubmitScoreRequest>,
) -> ApiResult<Json<SubmitScoreResponse>> {
    let db = state.require_db()?;

    let initials = body.initials.trim().to_uppercase();
    if initials.is_empty() || initials.len() > MAX_INITIALS_LEN {
        return Err(ApiError::BadRequest(format!(
            "initials must be 1-{MAX_INITIALS_LEN} characters"
        )));
    }
    if !initials.chars().all(|c| c.is_ascii_alphanumeric()) {
        return Err(ApiError::BadRequest("initials must be alphanumeric".into()));
    }
    if body.score > MAX_SCORE {
        return Err(ApiError::BadRequest("score out of range".into()));
    }

    let entry = HighScore {
        initials,
        score: body.score,
        created_at: OffsetDateTime::now_utc(),
    };

    db.high_scores()
        .insert_one(&entry)
        .await
        .map_err(|e| ApiError::Internal(e.to_string()))?;

    let higher_count = db
        .high_scores()
        .count_documents(doc! { "score": { "$gt": entry.score as i64 } })
        .await
        .map_err(|e| ApiError::Internal(e.to_string()))?;

    Ok(Json(SubmitScoreResponse {
        ok: true,
        rank: Some(higher_count + 1),
    }))
}

/// GET /game/leaderboard — top scores (public, requires MongoDB).
pub async fn leaderboard(State(state): State<AppState>) -> ApiResult<Json<LeaderboardResponse>> {
    let db = state.require_db()?;

    let cursor = db
        .high_scores()
        .find(doc! {})
        .sort(doc! { "score": -1, "created_at": 1 })
        .limit(LEADERBOARD_LIMIT)
        .await
        .map_err(|e| ApiError::Internal(e.to_string()))?;

    let scores: Vec<HighScore> = cursor
        .try_collect()
        .await
        .map_err(|e| ApiError::Internal(e.to_string()))?;

    Ok(Json(LeaderboardResponse { scores }))
}
