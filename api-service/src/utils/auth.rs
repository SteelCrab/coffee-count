use axum::{
    async_trait,
    extract::{Extension, FromRequestParts},
    http::{request::Parts, StatusCode},
    response::Json,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Clone)]
pub struct AuthService {
    client: Client,
    base_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyTokenRequest {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyTokenResponse {
    pub success: bool,
    pub data: Option<TokenData>,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenData {
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    pub user: UserInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub is_active: bool,
}

pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub user: UserInfo,
}

impl AuthService {
    pub fn new(base_url: &str) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.to_string(),
        }
    }

    pub async fn verify_token(&self, token: &str) -> Result<TokenData, String> {
        let url = format!("{}/api/auth/verify", self.base_url);
        
        let response = self
            .client
            .post(&url)
            .json(&VerifyTokenRequest {
                token: token.to_string(),
            })
            .send()
            .await
            .map_err(|e| format!("Failed to verify token: {}", e))?;

        if !response.status().is_success() {
            return Err("Token verification failed".to_string());
        }

        let verify_response: VerifyTokenResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if !verify_response.success {
            return Err(verify_response.message);
        }

        verify_response
            .data
            .ok_or_else(|| "No token data in response".to_string())
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        // Extract auth service from extensions
        let Extension(auth_service): Extension<AuthService> = 
            Extension::from_request_parts(parts, state)
                .await
                .map_err(|_| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({
                            "success": false,
                            "message": "Auth service not available"
                        }))
                    )
                })?;

        // Extract token from Authorization header
        let auth_header = parts
            .headers
            .get("authorization")
            .and_then(|header| header.to_str().ok())
            .and_then(|header| {
                if header.starts_with("Bearer ") {
                    Some(&header[7..])
                } else {
                    None
                }
            })
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({
                        "success": false,
                        "message": "Authorization header required"
                    }))
                )
            })?;

        // Verify token with auth service
        let token_data = auth_service
            .verify_token(auth_header)
            .await
            .map_err(|e| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({
                        "success": false,
                        "message": e
                    }))
                )
            })?;

        Ok(AuthenticatedUser {
            user_id: token_data.user_id,
            user: token_data.user,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_auth_service_creation() {
        let auth_service = AuthService::new("http://localhost:3001");
        assert_eq!(auth_service.base_url, "http://localhost:3001");
    }

    #[test]
    fn test_verify_token_request_serialization() {
        let request = VerifyTokenRequest {
            token: "test-token".to_string(),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("test-token"));
    }

    #[test]
    fn test_token_data_deserialization() {
        let user_id = Uuid::new_v4();
        let json = format!(
            r#"{{
                "userId": "{}",
                "user": {{
                    "id": "{}",
                    "email": "test@example.com",
                    "display_name": "Test User",
                    "is_active": true
                }}
            }}"#,
            user_id, user_id
        );

        let token_data: TokenData = serde_json::from_str(&json).unwrap();
        assert_eq!(token_data.user_id, user_id);
        assert_eq!(token_data.user.email, "test@example.com");
        assert_eq!(token_data.user.display_name, Some("Test User".to_string()));
        assert!(token_data.user.is_active);
    }

    #[test]
    fn test_verify_token_response_success() {
        let user_id = Uuid::new_v4();
        let json = format!(
            r#"{{
                "success": true,
                "message": "Token verified",
                "data": {{
                    "userId": "{}",
                    "user": {{
                        "id": "{}",
                        "email": "test@example.com",
                        "display_name": null,
                        "is_active": true
                    }}
                }}
            }}"#,
            user_id, user_id
        );

        let response: VerifyTokenResponse = serde_json::from_str(&json).unwrap();
        assert!(response.success);
        assert!(response.data.is_some());
        assert_eq!(response.message, "Token verified");
    }

    #[test]
    fn test_verify_token_response_failure() {
        let json = r#"{
            "success": false,
            "message": "Invalid token",
            "data": null
        }"#;

        let response: VerifyTokenResponse = serde_json::from_str(&json).unwrap();
        assert!(!response.success);
        assert!(response.data.is_none());
        assert_eq!(response.message, "Invalid token");
    }

    #[test]
    fn test_user_info_serialization() {
        let user_info = UserInfo {
            id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            display_name: Some("Test User".to_string()),
            is_active: true,
        };

        let json = serde_json::to_string(&user_info).unwrap();
        assert!(json.contains("test@example.com"));
        assert!(json.contains("Test User"));
        assert!(json.contains("true"));
    }

    #[tokio::test]
    async fn test_auth_service_url_construction() {
        let auth_service = AuthService::new("http://localhost:3001");
        let expected_url = format!("{}/api/auth/verify", auth_service.base_url);
        assert_eq!(expected_url, "http://localhost:3001/api/auth/verify");
    }

    // Mock tests for authenticated user
    fn mock_authenticated_user() -> AuthenticatedUser {
        let user_id = Uuid::new_v4();
        AuthenticatedUser {
            user_id,
            user: UserInfo {
                id: user_id,
                email: "test@example.com".to_string(),
                display_name: Some("Test User".to_string()),
                is_active: true,
            },
        }
    }

    #[test]
    fn test_authenticated_user_creation() {
        let user = mock_authenticated_user();
        assert!(!user.user.email.is_empty());
        assert_ne!(user.user_id, Uuid::nil());
        assert!(user.user.is_active);
    }
}
