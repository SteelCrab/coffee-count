# 🔧 환경 설정 가이드

이 문서는 Coffee Counter Microservices 프로젝트에서 사용되는 모든 환경 변수를 설명합니다.

## 📁 환경 파일 구조

```
coffee-counter-microservices/
├── .env                    # 메인 Docker Compose 환경
├── .env.example           # .env 파일 템플릿
├── auth-service/.env      # Node.js 인증 서비스 설정
├── api-service/.env       # Rust API 서비스 설정
├── api-service/.env.test  # Rust API 서비스 테스트 설정
└── frontend/.env          # React 프론트엔드 설정
```

## 🚀 빠른 설정

### 1. 템플릿 복사
```bash
cp .env.example .env
```

### 2. 보안 키 업데이트
`.env` 파일을 편집하고 다음 중요한 값들을 변경하세요:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `DOCKER_HUB_USERNAME`

### 3. 설정 확인
```bash
# 모든 환경 파일이 존재하는지 확인
ls -la .env auth-service/.env api-service/.env frontend/.env
```

## 📋 환경 변수 참조

### 🐳 메인 환경 (`.env`)

#### 데이터베이스 설정
```env
POSTGRES_DB=coffee_counter              # 데이터베이스 이름
POSTGRES_USER=coffee_user               # 데이터베이스 사용자
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE # 데이터베이스 패스워드 (변경 필요!)
POSTGRES_HOST=postgres                  # 데이터베이스 호스트
POSTGRES_PORT=5432                      # 데이터베이스 포트
```

#### Redis 설정
```env
REDIS_HOST=redis                        # Redis 호스트
REDIS_PORT=6379                         # Redis 포트
REDIS_PASSWORD=                         # Redis 패스워드 (선택사항)
```

#### JWT 설정
```env
JWT_SECRET=YOUR_JWT_SECRET_HERE    # JWT 서명 시크릿 (변경 필요!)
JWT_EXPIRES_IN=24h                      # 액세스 토큰 만료 시간
JWT_REFRESH_EXPIRES_IN=7d               # 리프레시 토큰 만료 시간
```

#### 보안
```env
BCRYPT_ROUNDS=12                        # 패스워드 해싱 라운드
RATE_LIMIT_WINDOW_MS=900000            # 속도 제한 윈도우 (15분)
RATE_LIMIT_MAX_REQUESTS=100            # 윈도우당 최대 요청 수
```

### 🔐 인증 서비스 (`auth-service/.env`)

#### 서버 설정
```env
NODE_ENV=development                    # 환경 모드
PORT=3001                              # 서비스 포트
HOST=0.0.0.0                           # 바인드 주소
```

#### 데이터베이스 설정
```env
DB_HOST=postgres                        # 데이터베이스 호스트
DB_PORT=5432                           # 데이터베이스 포트
DB_NAME=coffee_counter                 # 데이터베이스 이름
DB_USER=coffee_user                    # 데이터베이스 사용자
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE     # 데이터베이스 패스워드
DB_POOL_MIN=2                          # 최소 연결 풀 크기
DB_POOL_MAX=10                         # 최대 연결 풀 크기
```

#### Redis 설정
```env
REDIS_HOST=redis                        # Redis 호스트
REDIS_PORT=6379                        # Redis 포트
REDIS_DB=0                             # Redis 데이터베이스 번호
REDIS_KEY_PREFIX=coffee_counter:       # 키 접두사
```

#### 보안 설정
```env
BCRYPT_ROUNDS=12                       # 패스워드 해싱 라운드
SESSION_SECRET=your-session-secret     # 세션 시크릿 (변경 필요!)
CORS_ORIGIN=http://localhost:3000      # CORS 허용 오리진
CORS_CREDENTIALS=true                  # 자격 증명 허용
```

### 🦀 Rust API 서비스 (`api-service/.env`)

#### 서버 설정
```env
RUST_LOG=info                          # 로그 레벨
PORT=8080                              # 서비스 포트
HOST=0.0.0.0                           # 바인드 주소
```

#### 데이터베이스 설정
```env
DATABASE_URL=postgresql://coffee_user:YOUR_PASSWORD_HERE@postgres:5432/coffee_counter
DB_POOL_MAX_SIZE=10                    # 최대 연결 풀 크기
DB_POOL_MIN_IDLE=2                     # 최소 유휴 연결 수
DB_POOL_TIMEOUT=30                     # 연결 타임아웃 (초)
```

#### 인증 서비스 통합
```env
AUTH_SERVICE_URL=http://auth-service:3001  # 인증 서비스 URL
AUTH_SERVICE_TIMEOUT=5000              # 인증 서비스 타임아웃 (ms)
AUTH_VERIFY_ENDPOINT=/api/auth/verify  # 토큰 검증 엔드포인트
```

#### CORS 설정
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_MAX_AGE=3600                      # CORS 캐시 시간 (초)
```

### ⚛️ 프론트엔드 (`frontend/.env`)

#### API 설정
```env
REACT_APP_API_BASE_URL=http://localhost:3000      # 기본 API URL
REACT_APP_AUTH_SERVICE_URL=http://localhost:3001  # 인증 서비스 URL
REACT_APP_API_SERVICE_URL=http://localhost:8080   # API 서비스 URL
```

#### 애플리케이션 설정
```env
REACT_APP_VERSION=1.0.0                # 앱 버전
REACT_APP_ENVIRONMENT=development      # 환경
REACT_APP_APP_NAME=Coffee Counter      # 앱 이름
```

#### 빌드 설정
```env
GENERATE_SOURCEMAP=false               # 소스맵 생성
INLINE_RUNTIME_CHUNK=false            # 런타임 청크 인라인
SKIP_PREFLIGHT_CHECK=true             # 프리플라이트 체크 건너뛰기
```

#### 기능 플래그
```env
REACT_APP_ENABLE_DARK_MODE=true       # 다크 모드 활성화
REACT_APP_ENABLE_NOTIFICATIONS=true   # 알림 활성화
REACT_APP_ENABLE_EXPORT=true          # 데이터 내보내기 활성화
```

## 🔒 보안 모범 사례

### 1. 기본 시크릿 변경
```bash
# 안전한 JWT 시크릿 생성
openssl rand -base64 64

# 안전한 패스워드 생성
openssl rand -base64 32
```

### 2. 환경별 설정

#### 개발 환경
```env
NODE_ENV=development
RUST_LOG=debug
CORS_ORIGIN=http://localhost:3000
```

#### 프로덕션 환경
```env
NODE_ENV=production
RUST_LOG=warn
CORS_ORIGIN=https://your-domain.com
```

### 3. Docker Secrets (프로덕션)
```yaml
# docker-compose.prod.yml
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

## 🐳 Docker Compose 통합

### 환경 파일 로딩 순서
1. `.env` (메인 환경)
2. `docker-compose.yml` 환경 섹션
3. 서비스별 `.env` 파일

### Docker Compose 사용 예시
```yaml
services:
  auth-service:
    env_file:
      - .env
      - auth-service/.env
    environment:
      - NODE_ENV=${NODE_ENV:-development}
```

## 🧪 테스트 설정

### 테스트 환경 변수
```env
# api-service/.env.test
DATABASE_URL=postgresql://coffee_user:YOUR_PASSWORD_HERE@localhost:5432/coffee_counter_test
AUTH_SERVICE_URL=http://localhost:3001
RUST_LOG=debug
PORT=8081
```

### 환경과 함께 테스트 실행
```bash
# 테스트 환경 로드
export $(cat api-service/.env.test | xargs)

# 테스트 실행
cargo test
```

## 🔍 문제 해결

### 일반적인 문제

#### 1. 환경 변수가 로드되지 않음
```bash
# .env 파일 존재 확인
ls -la .env

# Docker Compose가 .env를 읽을 수 있는지 확인
docker-compose config
```

#### 2. 데이터베이스 연결 문제
```bash
# 데이터베이스 연결 테스트
docker-compose exec postgres pg_isready -U coffee_user

# 환경 변수 확인
docker-compose exec auth-service env | grep DB_
```

#### 3. 서비스 통신 문제
```bash
# 서비스 URL 확인
docker-compose exec auth-service env | grep SERVICE_URL
docker-compose exec api-service env | grep AUTH_SERVICE_URL
```

### 검증 명령어
```bash
# 모든 환경 파일 검증
./scripts/validate-env.sh

# 누락된 변수 확인
./scripts/check-env.sh
```

## 📝 환경 체크리스트

### 배포 전
- [ ] 기본 패스워드 변경
- [ ] JWT 시크릿 업데이트
- [ ] CORS 오리진 설정
- [ ] 적절한 로그 레벨 설정
- [ ] 데이터베이스 연결 확인
- [ ] 서비스 통신 테스트
- [ ] Docker Hub 자격 증명 검증

### 프로덕션 전용
- [ ] 민감한 데이터에 Docker secrets 사용
- [ ] SSL/TLS 활성화
- [ ] 모니터링 설정
- [ ] 로그 집계 설정
- [ ] 백업 전략 설정
- [ ] 보안 헤더 활성화

## 🔗 관련 문서

- [메인 README](../README.md) - 프로젝트 개요
- [Docker Hub 가이드](./DOCKER_HUB.md) - 배포 지침
- [스크립트 가이드](../scripts/README.md) - 빌드 및 배포 스크립트
