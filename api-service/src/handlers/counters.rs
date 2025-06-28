use axum::{
    extract::{Extension, Path, Query},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use chrono::NaiveDate;
use serde::Deserialize;
use serde_json::Value;
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;
use validator::Validate;

use crate::models::{AddCounterRequest, ApiResponse, CategoryCounterData, CounterDataResponse};
use crate::utils::auth::AuthenticatedUser;

#[derive(Debug, Deserialize)]
pub struct GetCounterQuery {
    pub date: Option<NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct GetCounterRangeQuery {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
}

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_counter_data).post(add_counter_data))
        .route("/range", get(get_counter_range))
        .route("/:date", get(get_counter_data_by_date))
}

pub async fn get_counter_data(
    user: AuthenticatedUser,
    Query(params): Query<GetCounterQuery>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<ApiResponse<CounterDataResponse>>, (StatusCode, Json<Value>)> {
    let date = params.date.unwrap_or_else(|| chrono::Utc::now().date_naive());
    
    get_counter_data_for_date(user, date, pool).await
}

pub async fn get_counter_data_by_date(
    user: AuthenticatedUser,
    Path(date): Path<NaiveDate>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<ApiResponse<CounterDataResponse>>, (StatusCode, Json<Value>)> {
    get_counter_data_for_date(user, date, pool).await
}

async fn get_counter_data_for_date(
    user: AuthenticatedUser,
    date: NaiveDate,
    pool: PgPool,
) -> Result<Json<ApiResponse<CounterDataResponse>>, (StatusCode, Json<Value>)> {
    #[derive(sqlx::FromRow)]
    struct CategoryDataRow {
        category_id: Uuid,
        name: String,
        icon: String,
        color: String,
        unit: String,
        count: Option<i32>,
        amounts: Option<Vec<f64>>,
    }

    let data = sqlx::query_as::<_, CategoryDataRow>(
        r#"
        SELECT 
            c.id as category_id,
            c.name,
            c.icon,
            c.color,
            c.unit,
            cd.count,
            cd.amounts
        FROM categories c
        LEFT JOIN counter_data cd ON c.id = cd.category_id AND cd.date = $1 AND cd.user_id = $2
        WHERE c.user_id = $2 AND c.is_active = true
        ORDER BY c.created_at ASC
        "#
    )
    .bind(date)
    .bind(user.user_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "success": false,
                "message": "Failed to fetch counter data"
            }))
        )
    })?;

    let mut categories = HashMap::new();

    for row in data {
        let amounts: Vec<f64> = row.amounts
            .unwrap_or_default();

        let total_amount: f64 = amounts.iter().sum();

        categories.insert(
            row.name.clone(),
            CategoryCounterData {
                category_id: row.category_id,
                name: row.name,
                icon: row.icon,
                color: row.color,
                unit: row.unit,
                count: row.count.unwrap_or(0),
                amounts,
                total_amount,
            },
        );
    }

    let response = CounterDataResponse { date, categories };

    Ok(Json(ApiResponse::success("Counter data retrieved successfully", response)))
}

pub async fn add_counter_data(
    user: AuthenticatedUser,
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<AddCounterRequest>,
) -> Result<Json<ApiResponse<CategoryCounterData>>, (StatusCode, Json<Value>)> {
    // Validate input
    if let Err(errors) = payload.validate() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "success": false,
                "message": "Validation failed",
                "errors": errors
            }))
        ));
    }

    #[derive(sqlx::FromRow)]
    struct CategoryInfo {
        name: String,
        icon: String,
        color: String,
        unit: String,
    }

    // Verify category belongs to user
    let category = sqlx::query_as::<_, CategoryInfo>(
        "SELECT name, icon, color, unit FROM categories WHERE id = $1 AND user_id = $2 AND is_active = true"
    )
    .bind(payload.category_id)
    .bind(user.user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "success": false,
                "message": "Failed to verify category"
            }))
        )
    })?;

    let category = category.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({
                "success": false,
                "message": "Category not found"
            }))
        )
    })?;

    let today = chrono::Utc::now().date_naive();
    let amount_decimal = payload.amount;

    #[derive(sqlx::FromRow)]
    struct CounterResult {
        count: i32,
        amounts: Vec<f64>,
    }

    // Insert or update counter data
    let result = sqlx::query_as::<_, CounterResult>(
        r#"
        INSERT INTO counter_data (user_id, category_id, date, count, amounts, notes)
        VALUES ($1, $2, $3, 1, ARRAY[$4], $5)
        ON CONFLICT (user_id, category_id, date)
        DO UPDATE SET 
            count = counter_data.count + 1,
            amounts = array_append(counter_data.amounts, $4),
            notes = CASE 
                WHEN $5 IS NOT NULL THEN 
                    CASE 
                        WHEN counter_data.notes IS NULL THEN $5
                        ELSE counter_data.notes || E'\n' || $5
                    END
                ELSE counter_data.notes
            END,
            updated_at = NOW()
        RETURNING count, amounts
        "#
    )
    .bind(user.user_id)
    .bind(payload.category_id)
    .bind(today)
    .bind(amount_decimal)
    .bind(payload.notes.as_deref())
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "success": false,
                "message": "Failed to add counter data"
            }))
        )
    })?;

    let amounts: Vec<f64> = result.amounts;

    let total_amount: f64 = amounts.iter().sum();

    let response = CategoryCounterData {
        category_id: payload.category_id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        unit: category.unit,
        count: result.count,
        amounts,
        total_amount,
    };

    Ok(Json(ApiResponse::success("Counter data added successfully", response)))
}

pub async fn get_counter_range(
    user: AuthenticatedUser,
    Query(params): Query<GetCounterRangeQuery>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<ApiResponse<Vec<CounterDataResponse>>>, (StatusCode, Json<Value>)> {
    #[derive(sqlx::FromRow)]
    struct CounterRangeRow {
        date: NaiveDate,
        category_id: Uuid,
        name: String,
        icon: String,
        color: String,
        unit: String,
        count: i32,
        amounts: Vec<f64>,
    }

    let data = sqlx::query_as::<_, CounterRangeRow>(
        r#"
        SELECT 
            cd.date,
            c.id as category_id,
            c.name,
            c.icon,
            c.color,
            c.unit,
            cd.count,
            cd.amounts
        FROM counter_data cd
        JOIN categories c ON c.id = cd.category_id
        WHERE cd.user_id = $1 AND cd.date BETWEEN $2 AND $3 AND c.is_active = true
        ORDER BY cd.date ASC, c.created_at ASC
        "#
    )
    .bind(user.user_id)
    .bind(params.start_date)
    .bind(params.end_date)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "success": false,
                "message": "Failed to fetch counter range data"
            }))
        )
    })?;

    let mut response_map: HashMap<NaiveDate, HashMap<String, CategoryCounterData>> = HashMap::new();

    for row in data {
        let amounts: Vec<f64> = row.amounts;

        let total_amount: f64 = amounts.iter().sum();

        let category_data = CategoryCounterData {
            category_id: row.category_id,
            name: row.name.clone(),
            icon: row.icon,
            color: row.color,
            unit: row.unit,
            count: row.count,
            amounts,
            total_amount,
        };

        response_map
            .entry(row.date)
            .or_insert_with(HashMap::new)
            .insert(row.name, category_data);
    }

    let mut responses: Vec<CounterDataResponse> = response_map
        .into_iter()
        .map(|(date, categories)| CounterDataResponse { date, categories })
        .collect();

    responses.sort_by_key(|r| r.date);

    Ok(Json(ApiResponse::success("Counter range data retrieved successfully", responses)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;
    use uuid::Uuid;

    #[test]
    fn test_get_counter_query_default_date() {
        let query = GetCounterQuery { date: None };
        let today = chrono::Utc::now().date_naive();
        let default_date = query.date.unwrap_or_else(|| chrono::Utc::now().date_naive());
        
        assert_eq!(default_date, today);
    }

    #[test]
    fn test_get_counter_query_with_date() {
        let test_date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let query = GetCounterQuery { date: Some(test_date) };
        
        assert_eq!(query.date.unwrap(), test_date);
    }

    #[test]
    fn test_get_counter_range_query_validation() {
        let start_date = NaiveDate::from_ymd_opt(2024, 1, 1).unwrap();
        let end_date = NaiveDate::from_ymd_opt(2024, 1, 31).unwrap();
        
        let query = GetCounterRangeQuery { start_date, end_date };
        
        assert!(query.start_date <= query.end_date);
    }

    // Mock helper for testing
    fn mock_authenticated_user() -> AuthenticatedUser {
        let user_id = Uuid::new_v4();
        AuthenticatedUser {
            user_id,
            user: crate::utils::auth::UserInfo {
                id: user_id,
                email: "test@example.com".to_string(),
                display_name: Some("Test User".to_string()),
                is_active: true,
            },
        }
    }

    #[test]
    fn test_mock_user_creation() {
        let user = mock_authenticated_user();
        assert!(!user.user.email.is_empty());
        assert_ne!(user.user_id, Uuid::nil());
        assert!(user.user.is_active);
    }
}
