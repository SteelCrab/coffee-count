// Simplified categories handler for testing
use axum::{
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub unit: String,
    pub default_amount: f64,
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub icon: String,
    pub color: String,
    pub unit: String,
    pub default_amount: f64,
}

// Routes function
pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_categories).post(create_category))
}

// Mock handlers for testing
pub async fn get_categories() -> Result<Json<Vec<Category>>, StatusCode> {
    Ok(Json(vec![]))
}

pub async fn create_category(
    Json(payload): Json<CreateCategoryRequest>,
) -> Result<(StatusCode, Json<Category>), StatusCode> {
    let category = Category {
        id: Uuid::new_v4(),
        name: payload.name,
        icon: payload.icon,
        color: payload.color,
        unit: payload.unit,
        default_amount: payload.default_amount,
        is_active: true,
    };

    Ok((StatusCode::CREATED, Json(category)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_category_creation() {
        let category = Category {
            id: Uuid::new_v4(),
            name: "Coffee".to_string(),
            icon: "coffee".to_string(),
            color: "#8B4513".to_string(),
            unit: "ml".to_string(),
            default_amount: 250.0,
            is_active: true,
        };

        assert_eq!(category.name, "Coffee");
        assert_eq!(category.default_amount, 250.0);
        assert!(category.is_active);
    }

    #[test]
    fn test_create_category_request() {
        let request = CreateCategoryRequest {
            name: "Tea".to_string(),
            icon: "tea".to_string(),
            color: "#90EE90".to_string(),
            unit: "ml".to_string(),
            default_amount: 200.0,
        };

        assert_eq!(request.name, "Tea");
        assert_eq!(request.default_amount, 200.0);
    }

    #[test]
    fn test_update_category_request() {
        let request = UpdateCategoryRequest {
            name: Some("Updated Coffee".to_string()),
            icon: None,
            color: Some("#654321".to_string()),
            unit: None,
            default_amount: Some(300.0),
        };

        assert_eq!(request.name, Some("Updated Coffee".to_string()));
        assert_eq!(request.icon, None);
        assert_eq!(request.default_amount, Some(300.0));
    }

    #[test]
    fn test_category_query_defaults() {
        let query = CategoryQuery { active_only: None };
        assert_eq!(query.active_only.unwrap_or(true), true);

        let query = CategoryQuery { active_only: Some(false) };
        assert_eq!(query.active_only.unwrap_or(true), false);
    }

    #[tokio::test]
    async fn test_get_categories_handler() {
        let result = get_categories().await;
        assert!(result.is_ok());
        
        let categories = result.unwrap().0;
        assert_eq!(categories.len(), 0); // Empty mock response
    }

    #[tokio::test]
    async fn test_create_category_handler() {
        let request = CreateCategoryRequest {
            name: "Test Category".to_string(),
            icon: "test".to_string(),
            color: "#FF0000".to_string(),
            unit: "units".to_string(),
            default_amount: 1.0,
        };

        let result = create_category(Json(request)).await;
        assert!(result.is_ok());

        let (status, category) = result.unwrap();
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(category.name, "Test Category");
        assert_eq!(category.default_amount, 1.0);
        assert!(category.is_active);
    }
}
