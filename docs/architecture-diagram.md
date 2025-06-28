# 🏗️ 시스템 아키텍처 다이어그램

Coffee Counter Microservices의 상세한 시스템 아키텍처와 컴포넌트 설명입니다.

## 📊 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Coffee Counter Microservices                          │
│                                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐            │
│  │   Frontend      │    │     Nginx        │    │ Auth Service    │            │
│  │   (React)       │◄──►│  Reverse Proxy   │◄──►│   (Node.js)     │            │
│  │   Port: 3000    │    │   (Built-in)     │    │   Port: 3001    │            │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘            │
│                                  │                        │                     │
│                                  │                        ▼                     │
│                                  │               ┌─────────────────┐            │
│                                  │               │     Redis       │            │
│                                  │               │   Port: 6379    │            │
│                                  │               └─────────────────┘            │
│                                  ▼                        │                     │
│                         ┌─────────────────┐              │                     │
│                         │   PostgreSQL    │◄─────────────┘                     │
│                         │   Port: 5432    │                                    │
│                         └─────────────────┘                                    │
│                                  ▲                                             │
│                                  │                                             │
│                         ┌─────────────────┐                                    │
│                         │   Rust API      │                                    │
│                         │   Service       │                                    │
│                         │   Port: 8080    │                                    │
│                         └─────────────────┘                                    │
│                                  ▲                                             │
│                                  │                                             │
│                         ┌─────────────────┐                                    │
│                         │   Frontend      │                                    │
│                         │   API Calls     │                                    │
│                         └─────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 컴포넌트 상세 설명

### 🌐 프론트엔드 (React)
- **포트**: 3000
- **기술 스택**: React + TypeScript + Tailwind CSS
- **책임**:
  - 커피 추적을 위한 사용자 인터페이스
  - 인증 UI
  - 카테고리 관리
  - 카운터 데이터 시각화
  - 모바일 지원을 포함한 반응형 디자인

### 🔐 인증 서비스 (Node.js)
- **포트**: 3001
- **기술 스택**: Node.js + Express
- **책임**:
  - 사용자 등록 및 로그인
  - JWT 토큰 관리
  - Redis를 통한 세션 관리
  - bcrypt를 사용한 패스워드 해싱
  - 속도 제한 및 보안
  - 사용자 프로필 관리

### 🦀 Rust API 서비스
- **포트**: 8080
- **기술 스택**: Rust + Axum
- **책임**:
  - 카테고리 CRUD 작업
  - 카운터 데이터 관리
  - 고성능 데이터 처리
  - SQLx를 사용한 데이터베이스 작업
  - 인증 서비스와의 토큰 검증
  - 메모리 안전성과 제로 비용 추상화

### 🗄️ 데이터베이스 (PostgreSQL)
- **포트**: 5432
- **기능**:
  - ACID 준수
  - JSON/JSONB 지원
  - 고급 인덱싱
  - 행 수준 보안

### 🔄 캐시 (Redis)
- **포트**: 6379
- **사용 용도**:
  - 세션 저장
  - 속도 제한
  - 캐싱 레이어

### 🌐 리버스 프록시 (Nginx)
- **포트**: 80
- **기능**:
  - 로드 밸런싱
  - SSL 종료
  - 속도 제한
  - CORS 처리

## 📡 API 엔드포인트

### 인증 서비스 (포트 3001)

#### 인증 엔드포인트
```bash
POST /api/auth/register     # 새 사용자 등록
POST /api/auth/login        # 사용자 로그인
POST /api/auth/refresh      # 액세스 토큰 갱신
POST /api/auth/logout       # 사용자 로그아웃
POST /api/auth/verify       # 토큰 검증 (내부용)
```

#### 사용자 엔드포인트
```bash
GET  /api/users/profile     # 사용자 프로필 조회
PUT  /api/users/profile     # 사용자 프로필 업데이트
GET  /api/users/sessions    # 사용자 세션 조회
DELETE /api/users/sessions/:id  # 세션 해제
DELETE /api/users/account   # 계정 삭제
```

### Rust API 서비스 (포트 8080)

#### 카테고리
```bash
GET    /api/categories      # 모든 카테고리 조회
POST   /api/categories      # 카테고리 생성
GET    /api/categories/:id  # ID로 카테고리 조회
PUT    /api/categories/:id  # 카테고리 업데이트
DELETE /api/categories/:id  # 카테고리 삭제
```

#### 카운터
```bash
GET  /api/counters          # 카운터 데이터 조회
POST /api/counters          # 카운터 항목 추가
GET  /api/counters/range    # 날짜 범위 데이터 조회
GET  /api/counters/:date    # 특정 날짜 데이터 조회
```

## 📊 데이터베이스 스키마

### 사용자 테이블
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);
```

### 카테고리 테이블
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'coffee',
    color VARCHAR(20) NOT NULL DEFAULT '#8B4513',
    unit VARCHAR(20) NOT NULL DEFAULT 'ml',
    default_amount DECIMAL(10,2) NOT NULL DEFAULT 250.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 카운터 데이터 테이블
```sql
CREATE TABLE counter_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    amounts DECIMAL(10,2)[] NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, category_id, date)
);
```

## 🔄 데이터 흐름

### 1. 사용자 등록 흐름
```
사용자 → 프론트엔드 → 인증 서비스 → PostgreSQL
                                    ↓
                                  Redis (세션)
```

### 2. 로그인 흐름
```
사용자 → 프론트엔드 → 인증 서비스 → PostgreSQL (사용자 검증)
                                    ↓
                                  JWT 토큰 생성
                                    ↓
                                  Redis (세션 저장)
```

### 3. 카테고리 생성 흐름
```
사용자 → 프론트엔드 → Rust API → 인증 서비스 (토큰 검증)
                                    ↓
                                PostgreSQL (카테고리 저장)
```

### 4. 카운터 데이터 추가 흐름
```
사용자 → 프론트엔드 → Rust API → 인증 서비스 (토큰 검증)
                                    ↓
                                PostgreSQL (데이터 저장/업데이트)
```

## 🔐 보안 아키텍처

### 인증 흐름
```
┌─────────────┐    JWT 토큰    ┌─────────────┐    토큰 검증    ┌─────────────┐
│  프론트엔드  │ ──────────────► │  Rust API   │ ──────────────► │  인증 서비스  │
└─────────────┘                └─────────────┘                └─────────────┘
                                       │                              │
                                       ▼                              ▼
                               ┌─────────────┐                ┌─────────────┐
                               │ PostgreSQL  │                │    Redis    │
                               └─────────────┘                └─────────────┘
```

### 보안 계층
1. **네트워크 보안**: Docker 네트워크 격리
2. **인증**: JWT 토큰 기반 인증
3. **인가**: 사용자별 데이터 접근 제어
4. **데이터 보안**: 패스워드 해싱, SQL 인젝션 방지
5. **속도 제한**: API 남용 방지

## 🚀 성능 최적화

### 데이터베이스 최적화
- 적절한 인덱스 설정
- 연결 풀링
- 쿼리 최적화

### 캐싱 전략
- Redis를 통한 세션 캐싱
- 자주 접근하는 데이터 캐싱
- HTTP 캐시 헤더 설정

### 서비스 최적화
- Rust의 제로 비용 추상화
- 비동기 처리
- 연결 풀 관리

## 📈 확장성 고려사항

### 수평 확장
- 상태 비저장 서비스 설계
- 로드 밸런서를 통한 트래픽 분산
- 데이터베이스 읽기 복제본

### 수직 확장
- 리소스 모니터링
- 성능 병목 지점 식별
- 하드웨어 업그레이드

## 🔍 모니터링 및 로깅

### 헬스 체크
- 각 서비스별 헬스 엔드포인트
- 데이터베이스 연결 상태 확인
- 외부 의존성 상태 확인

### 로깅 전략
- 구조화된 로깅
- 중앙 집중식 로그 수집
- 로그 레벨별 분류

### 메트릭 수집
- 응답 시간 측정
- 에러율 추적
- 리소스 사용량 모니터링

## 🛠️ 개발 및 배포

### 로컬 개발 환경
```bash
# 모든 서비스 시작
docker-compose up -d

# 개별 서비스 개발
cd auth-service && npm run dev
cd api-service && cargo run
cd frontend && npm start
```

### 프로덕션 배포
```bash
# Docker Hub 이미지 사용
docker-compose -f docker-compose-hub.yml up -d

# 또는 로컬 빌드
./scripts/build.sh
```

---

**이 아키텍처는 확장성, 보안성, 유지보수성을 고려하여 설계되었습니다.**
