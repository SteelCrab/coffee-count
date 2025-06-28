use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Category {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub unit: String,
    pub default_amount: f64,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateCategoryRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[validate(length(min = 1, max = 50))]
    pub icon: String,
    #[validate(length(min = 1, max = 20))]
    pub color: String,
    #[validate(length(min = 1, max = 20))]
    pub unit: String,
    #[validate(range(min = 0.01))]
    pub default_amount: f64,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UpdateCategoryRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: Option<String>,
    #[validate(length(min = 1, max = 50))]
    pub icon: Option<String>,
    #[validate(length(min = 1, max = 20))]
    pub color: Option<String>,
    #[validate(length(min = 1, max = 20))]
    pub unit: Option<String>,
    #[validate(range(min = 0.01))]
    pub default_amount: Option<f64>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CounterData {
    pub id: Uuid,
    pub user_id: Uuid,
    pub category_id: Uuid,
    pub date: NaiveDate,
    pub count: i32,
    pub amounts: Vec<f64>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct AddCounterRequest {
    pub category_id: Uuid,
    #[validate(range(min = 0.01))]
    pub amount: f64,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CounterDataResponse {
    pub date: NaiveDate,
    pub categories: std::collections::HashMap<String, CategoryCounterData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryCounterData {
    pub category_id: Uuid,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub unit: String,
    pub count: i32,
    pub amounts: Vec<f64>,
    pub total_amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

impl<T> ApiResponse<T> {
    pub fn success(message: &str, data: T) -> Self {
        Self {
            success: true,
            message: message.to_string(),
            data: Some(data),
        }
    }

    #[allow(dead_code)]
    pub fn error(message: &str) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            message: message.to_string(),
            data: None,
        }
    }
}
