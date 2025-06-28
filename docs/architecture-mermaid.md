# 🎨 Mermaid 아키텍처 다이어그램

Coffee Counter Microservices의 시각적 아키텍처 다이어그램 모음입니다.

## 🏗️ 시스템 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "Coffee Counter Microservices"
        subgraph "프론트엔드 계층"
            FE[Frontend<br/>React + TypeScript<br/>Port: 3000]
        end
        
        subgraph "서비스 계층"
            AUTH[인증 서비스<br/>Node.js + Express<br/>Port: 3001]
            API[Rust API 서비스<br/>Rust + Axum<br/>Port: 8080]
        end
        
        subgraph "데이터 계층"
            DB[(PostgreSQL<br/>Port: 5432)]
            CACHE[(Redis<br/>Port: 6379)]
        end
        
        subgraph "인프라 계층"
            NGINX[Nginx<br/>리버스 프록시<br/>Port: 80]
        end
    end
    
    FE <--> NGINX
    NGINX <--> AUTH
    NGINX <--> API
    FE <--> API
    AUTH <--> DB
    AUTH <--> CACHE
    API <--> DB
    API <--> AUTH
```

## 🔄 데이터 흐름 다이어그램

```mermaid
sequenceDiagram
    participant U as 사용자
    participant F as 프론트엔드
    participant A as 인증 서비스
    participant R as Rust API
    participant D as PostgreSQL
    participant C as Redis
    
    Note over U,C: 사용자 등록 흐름
    U->>F: 등록 요청
    F->>A: POST /api/auth/register
    A->>D: 사용자 데이터 저장
    A->>C: 세션 생성
    A->>F: JWT 토큰 반환
    F->>U: 등록 완료
    
    Note over U,C: 카테고리 생성 흐름
    U->>F: 카테고리 생성
    F->>R: POST /api/categories (with JWT)
    R->>A: 토큰 검증
    A->>R: 사용자 정보 반환
    R->>D: 카테고리 저장
    R->>F: 생성된 카테고리 반환
    F->>U: 카테고리 생성 완료
```

## 🔐 보안 아키텍처 다이어그램

```mermaid
graph LR
    subgraph "보안 계층"
        subgraph "인증 & 인가"
            JWT[JWT 토큰]
            SESSION[세션 관리]
            BCRYPT[패스워드 해싱]
        end
        
        subgraph "네트워크 보안"
            CORS[CORS 정책]
            RATE[속도 제한]
            HTTPS[HTTPS/TLS]
        end
        
        subgraph "데이터 보안"
            ENCRYPT[데이터 암호화]
            VALIDATE[입력 검증]
            SANITIZE[데이터 정제]
        end
    end
    
    subgraph "서비스"
        FE[프론트엔드]
        AUTH[인증 서비스]
        API[Rust API]
        DB[(데이터베이스)]
    end
    
    FE --> CORS
    FE --> JWT
    AUTH --> SESSION
    AUTH --> BCRYPT
    API --> VALIDATE
    API --> RATE
    DB --> ENCRYPT
```

## 📊 데이터베이스 ERD

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar display_name
        boolean is_active
        boolean email_verified
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_login
    }
    
    CATEGORIES {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar icon
        varchar color
        varchar unit
        decimal default_amount
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }
    
    COUNTER_DATA {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        date date
        integer count
        decimal_array amounts
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
    
    USERS ||--o{ CATEGORIES : "소유"
    USERS ||--o{ COUNTER_DATA : "생성"
    CATEGORIES ||--o{ COUNTER_DATA : "포함"
```

## 🚀 배포 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "개발 환경"
        DEV_FE[프론트엔드<br/>개발 서버]
        DEV_AUTH[인증 서비스<br/>개발 모드]
        DEV_API[Rust API<br/>개발 모드]
        DEV_DB[(로컬 PostgreSQL)]
        DEV_REDIS[(로컬 Redis)]
    end
    
    subgraph "Docker 컨테이너"
        DOCKER_FE[프론트엔드<br/>컨테이너]
        DOCKER_AUTH[인증 서비스<br/>컨테이너]
        DOCKER_API[Rust API<br/>컨테이너]
        DOCKER_DB[(PostgreSQL<br/>컨테이너)]
        DOCKER_REDIS[(Redis<br/>컨테이너)]
    end
    
    subgraph "Docker Hub"
        HUB_FE[yongcoffee/<br/>frontend:latest]
        HUB_AUTH[yongcoffee/<br/>auth-service:latest]
        HUB_API[yongcoffee/<br/>api-service:latest]
    end
    
    subgraph "프로덕션"
        PROD_LB[로드 밸런서]
        PROD_FE[프론트엔드<br/>인스턴스들]
        PROD_AUTH[인증 서비스<br/>인스턴스들]
        PROD_API[Rust API<br/>인스턴스들]
        PROD_DB[(PostgreSQL<br/>클러스터)]
        PROD_REDIS[(Redis<br/>클러스터)]
    end
    
    DEV_FE --> DOCKER_FE
    DEV_AUTH --> DOCKER_AUTH
    DEV_API --> DOCKER_API
    
    DOCKER_FE --> HUB_FE
    DOCKER_AUTH --> HUB_AUTH
    DOCKER_API --> HUB_API
    
    HUB_FE --> PROD_FE
    HUB_AUTH --> PROD_AUTH
    HUB_API --> PROD_API
    
    PROD_LB --> PROD_FE
    PROD_LB --> PROD_AUTH
    PROD_LB --> PROD_API
```

## 🔄 CI/CD 파이프라인 다이어그램

```mermaid
graph LR
    subgraph "소스 코드"
        GIT[Git 저장소]
        BRANCH[기능 브랜치]
        MAIN[메인 브랜치]
    end
    
    subgraph "CI/CD 파이프라인"
        TRIGGER[GitHub Actions<br/>트리거]
        BUILD[빌드 & 테스트]
        DOCKER[Docker 이미지<br/>빌드]
        PUSH[Docker Hub<br/>푸시]
        DEPLOY[배포]
    end
    
    subgraph "배포 환경"
        STAGING[스테이징 환경]
        PROD[프로덕션 환경]
    end
    
    BRANCH --> GIT
    GIT --> MAIN
    MAIN --> TRIGGER
    TRIGGER --> BUILD
    BUILD --> DOCKER
    DOCKER --> PUSH
    PUSH --> STAGING
    STAGING --> PROD
```

## 📈 모니터링 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "애플리케이션 계층"
        FE[프론트엔드]
        AUTH[인증 서비스]
        API[Rust API]
        DB[(데이터베이스)]
        REDIS[(Redis)]
    end
    
    subgraph "모니터링 계층"
        METRICS[메트릭 수집<br/>Prometheus]
        LOGS[로그 수집<br/>ELK Stack]
        TRACES[분산 추적<br/>Jaeger]
    end
    
    subgraph "시각화 계층"
        GRAFANA[Grafana<br/>대시보드]
        KIBANA[Kibana<br/>로그 분석]
        ALERTS[알림 시스템]
    end
    
    subgraph "헬스 체크"
        HEALTH[헬스 체크<br/>엔드포인트]
        UPTIME[가동 시간<br/>모니터링]
    end
    
    FE --> METRICS
    AUTH --> METRICS
    API --> METRICS
    DB --> METRICS
    REDIS --> METRICS
    
    FE --> LOGS
    AUTH --> LOGS
    API --> LOGS
    
    FE --> TRACES
    AUTH --> TRACES
    API --> TRACES
    
    METRICS --> GRAFANA
    LOGS --> KIBANA
    TRACES --> GRAFANA
    
    GRAFANA --> ALERTS
    KIBANA --> ALERTS
    
    FE --> HEALTH
    AUTH --> HEALTH
    API --> HEALTH
    
    HEALTH --> UPTIME
```

## 🌐 네트워크 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "외부 네트워크"
        INTERNET[인터넷]
        CDN[CDN]
        DNS[DNS]
    end
    
    subgraph "DMZ"
        LB[로드 밸런서]
        WAF[웹 방화벽]
        PROXY[리버스 프록시]
    end
    
    subgraph "애플리케이션 네트워크"
        subgraph "프론트엔드 서브넷"
            FE1[프론트엔드 1]
            FE2[프론트엔드 2]
        end
        
        subgraph "백엔드 서브넷"
            AUTH1[인증 서비스 1]
            AUTH2[인증 서비스 2]
            API1[Rust API 1]
            API2[Rust API 2]
        end
    end
    
    subgraph "데이터 네트워크"
        subgraph "데이터베이스 서브넷"
            DB_MASTER[(PostgreSQL<br/>마스터)]
            DB_SLAVE[(PostgreSQL<br/>슬레이브)]
            REDIS_MASTER[(Redis<br/>마스터)]
            REDIS_SLAVE[(Redis<br/>슬레이브)]
        end
    end
    
    INTERNET --> CDN
    CDN --> DNS
    DNS --> LB
    LB --> WAF
    WAF --> PROXY
    
    PROXY --> FE1
    PROXY --> FE2
    
    FE1 --> AUTH1
    FE1 --> AUTH2
    FE1 --> API1
    FE1 --> API2
    
    FE2 --> AUTH1
    FE2 --> AUTH2
    FE2 --> API1
    FE2 --> API2
    
    AUTH1 --> DB_MASTER
    AUTH2 --> DB_MASTER
    API1 --> DB_MASTER
    API2 --> DB_MASTER
    
    AUTH1 --> REDIS_MASTER
    AUTH2 --> REDIS_MASTER
    
    DB_MASTER --> DB_SLAVE
    REDIS_MASTER --> REDIS_SLAVE
```

## 📱 사용자 여정 다이어그램

```mermaid
journey
    title 커피 카운터 사용자 여정
    section 계정 생성
      웹사이트 방문: 5: 사용자
      회원가입 클릭: 4: 사용자
      정보 입력: 3: 사용자
      이메일 인증: 4: 사용자
      계정 활성화: 5: 사용자
    section 첫 사용
      로그인: 5: 사용자
      카테고리 생성: 4: 사용자
      첫 카운트 추가: 5: 사용자
      데이터 확인: 5: 사용자
    section 일상 사용
      앱 열기: 5: 사용자
      카운트 추가: 5: 사용자
      통계 확인: 4: 사용자
      목표 설정: 3: 사용자
    section 고급 기능
      데이터 내보내기: 3: 사용자
      설정 변경: 2: 사용자
      프로필 업데이트: 2: 사용자
```

---

**이 다이어그램들은 시스템의 다양한 측면을 시각적으로 표현합니다.**
