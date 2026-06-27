mod gate2;
mod game;
mod email;
mod health;
mod magazine;

use axum::{routing::{get, post}, Router};

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health::health))
        .route("/gate2/verify", post(gate2::verify))
        .route("/gate2/status", get(gate2::status))
        .route("/magazine/url", get(magazine::presign_url))
        .route("/game/score", post(game::submit_score))
        .route("/game/leaderboard", get(game::leaderboard))
        .route("/email/subscribe", post(email::subscribe))

}
