use axum::{extract::Query, Json};
use serde::{Deserialize, Serialize};

use crate::auth::Gate2Session;
use crate::error::{ApiError, ApiResult};

#[derive(Deserialize)]
pub struct MagazineQuery {
    pub page: u32,
}

#[derive(Serialize)]
pub struct MagazineUrlResponse {
    pub page: u32,
    pub url: String,
    pub expires_in_secs: u64,
}

/// GET /magazine/url?page=N — requires valid gate2 cookie.
/// S3 presigning will be wired in once AWS creds are configured.
pub async fn presign_url(
    _session: Gate2Session,
    Query(query): Query<MagazineQuery>,
) -> ApiResult<Json<MagazineUrlResponse>> {
    if query.page == 0 {
        return Err(ApiError::BadRequest("page must be >= 1".into()));
    }

    // Placeholder until aws-sdk-s3 is added — structure is ready for presign.
    Err(ApiError::ServiceUnavailable(
        "magazine presign not configured yet (S3_BUCKET / AWS creds)".into(),
    ))
}
