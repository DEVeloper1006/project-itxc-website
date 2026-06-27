use std::net::SocketAddr;

use axum::http::Method;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

mod auth;
mod config;
mod db;
mod error;
mod models;
mod routes;
mod state;

use config::Config;
use db::Db;
use state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::from_default_env().add_directive("itxc_api=info".parse().unwrap()),
        )
        .init();

    let config = Config::from_env().expect("invalid configuration");
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("invalid HOST/PORT");

    let db = match &config.mongodb_uri {
        Some(uri) => {
            tracing::info!("connecting to mongodb");
            let db = Db::connect(uri, &config.mongodb_db)
                .await
                .expect("failed to connect to mongodb");
            tracing::info!(db = %config.mongodb_db, "mongodb connected");
            Some(db)
        }
        None => {
            tracing::warn!("MONGODB_URI not set — game scores and email routes disabled");
            None
        }
    };

    let state = AppState::new(config.clone(), db);

    let cors = CorsLayer::new()
        .allow_origin(
            config
                .allowed_origins
                .iter()
                .map(|o| o.parse().expect("invalid ALLOWED_ORIGINS entry"))
                .collect::<Vec<_>>(),
        )
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([axum::http::header::CONTENT_TYPE, axum::http::header::COOKIE])
        .allow_credentials(true);

    let app = routes::router()
        .with_state(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    tracing::info!(%addr, "itxc-api listening");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
