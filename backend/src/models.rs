use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HighScore {
    pub initials: String,
    pub score: u64,
    #[serde(with = "time::serde::timestamp")]
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmailSignup {
    pub email: String,
    #[serde(with = "time::serde::timestamp")]
    pub created_at: OffsetDateTime,
}
