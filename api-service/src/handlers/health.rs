use axum::{extract::Extension, response::Json};
use serde_json::{json, Value};
use sqlx::PgPool;

pub async fn health_check(Extension(pool): Extension<PgPool>) -> Json<Value> {
    // Check database connection
    let db_status = match sqlx::query("SELECT 1").fetch_one(&pool).await {
        Ok(_) => "healthy",
        Err(_) => "unhealthy",
    };

    Json(json!({
        "status": if db_status == "healthy" { "healthy" } else { "unhealthy" },
        "service": "coffee-counter-api",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now(),
        "database": db_status
    }))
}
