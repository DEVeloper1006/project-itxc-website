use std::sync::Arc;

use crate::config::Config;
use crate::db::Db;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: Option<Db>,
}

impl AppState {
    pub fn new(config: Config, db: Option<Db>) -> Self {
        Self {
            config: Arc::new(config),
            db,
        }
    }

    pub fn require_db(&self) -> Result<&Db, crate::error::ApiError> {
        self.db.as_ref().ok_or_else(|| {
            crate::error::ApiError::ServiceUnavailable(
                "database not configured (set MONGODB_URI)".into(),
            )
        })
    }
}
