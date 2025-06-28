# ☕ 커피 카운터 마이크로서비스

**Node.js 인증 서비스**, **Rust API 백엔드**, **PostgreSQL 데이터베이스**를 사용한 현대적인 마이크로서비스 아키텍처의 커피 카운터 애플리케이션입니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Nginx        │    │ Auth Service    │
│   (React)       │◄──►│  Reverse Proxy   │◄──►│   (Node.js)     │
│   Port: 3000    │    │   (Built-in)     │    │   Port: 3001    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                                │               ┌─────────────────┐
                                │               │     Redis       │
                                │               │   Port: 6379    │
                                │               └─────────────────┘
                                ▼                        │
                       ┌─────────────────┐              │
                       │   PostgreSQL    │◄─────────────┘
                       │   Port: 5432    │
                       └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │   Rust API      │
                       │   Service       │
                       │   Port: 8080    │
                       └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │   Frontend      │
                       │   API Calls     │
                       └─────────────────┘
```

## 🚀 빠른 시작

### 사전 요구사항
- Docker & Docker Compose
- Node.js 18+ (로컬 개발용)
- Rust 1.75+ (로컬 개발용)

### 방법 1: Docker Hub 이미지 사용 (권장)

가장 빠르고 쉬운 방법입니다:

```bash
# 저장소 클론
git clone <repository>
cd coffee-counter-microservices

# 환경 설정 복사
cp .env.example .env

# Docker Hub 이미지로 즉시 실행
docker-compose -f docker-compose-hub.yml up -d
```

### 방법 2: 로컬 빌드

개발이나 커스터마이징이 필요한 경우:

```bash
# 저장소 클론
git clone <repository>
cd coffee-counter-microservices

# 환경 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 설정 변경

# 모든 서비스 빌드 및 시작
./scripts/build.sh
```

### 서비스 접속
- **프론트엔드**: http://localhost:3000
- **인증 서비스**: http://localhost:3001
- **Rust API 서비스**: http://localhost:8080

## 🧪 테스트

### 자동 테스트 실행
```bash
# 로컬 빌드 테스트
./scripts/test.sh

# Docker Hub 이미지 테스트
./scripts/test-docker-hub.sh
```

### 수동 API 테스트

#### 1. 사용자 등록
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "displayName": "테스트 사용자"
  }'
```

#### 2. 로그인
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

#### 3. 카테고리 생성
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "커피",
    "icon": "coffee",
    "color": "#8B4513",
    "unit": "ml",
    "default_amount": 250.0
  }'
```

## 🐳 Docker Hub 배포

### 개발자용 배포 워크플로우

```bash
# 1. 로컬에서 빌드 및 테스트
./scripts/build.sh
./scripts/test.sh

# 2. 배포 미리보기
./scripts/docker-hub-deploy-dry-run.sh

# 3. Docker Hub에 배포
./scripts/docker-hub-deploy.sh

# 4. 배포된 이미지 테스트
./scripts/test-docker-hub.sh
```

### 사용 가능한 Docker Hub 이미지

- **프론트엔드**: `pyh5523/coffee-counter-frontend:latest`
- **인증 서비스**: `pyh5523/coffee-counter-auth-service:latest`
- **API 서비스**: `pyh5523/coffee-counter-api-service:latest`

자세한 Docker Hub 배포 지침은 [docs/DOCKER_HUB.md](./docs/DOCKER_HUB.md)를 참조하세요.

## 🔧 환경 설정

### 필수 환경 변수

`.env` 파일에서 다음 값들을 반드시 변경하세요:

```env
# 보안 설정 (반드시 변경!)
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=YOUR_JWT_SECRET_HERE

# Docker Hub 설정 (배포 시 필요)
DOCKER_HUB_USERNAME=your-dockerhub-username
PROJECT_NAME=coffee-counter
```

환경 설정에 대한 자세한 내용은 [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)를 참조하세요.

## 📚 문서

- **[아키텍처 문서](./docs/)** - 상세한 시스템 아키텍처 및 다이어그램
- **[Docker Hub 가이드](./docs/DOCKER_HUB.md)** - Docker Hub 배포 지침
- **[환경 설정 가이드](./docs/ENVIRONMENT.md)** - 환경 변수 설정 가이드
- **[스크립트 문서](./scripts/)** - 빌드 및 배포 스크립트 가이드
- **[프론트엔드 문서](./frontend/README.md)** - 프론트엔드 전용 설정 및 개발

## 🛠️ 개발

### 로컬 개발 환경 설정

#### 전체 서비스 개발
```bash
# Docker로 개발 환경 시작
./scripts/build.sh

# 또는 개별 서비스 개발
```

#### 인증 서비스 개발
```bash
cd auth-service
npm install
npm run dev
```

#### Rust API 서비스 개발
```bash
cd api-service
cargo run
```

#### 프론트엔드 개발
```bash
cd frontend
npm install
npm start
```

## 🔧 사용 가능한 스크립트

모든 스크립트는 `scripts/` 디렉토리에 위치합니다:

### 빌드 및 테스트
- **`build.sh`** - 모든 서비스 빌드 및 시작
- **`test.sh`** - 종합 테스트 실행

### Docker Hub 배포
- **`docker-hub-deploy-dry-run.sh`** - Docker Hub 배포 미리보기
- **`docker-hub-deploy.sh`** - Docker Hub에 실제 배포
- **`test-docker-hub.sh`** - Docker Hub 이미지 테스트

### 사용 예시
```bash
# 개발 워크플로우
./scripts/build.sh                      # 빌드
./scripts/test.sh                       # 테스트
./scripts/docker-hub-deploy-dry-run.sh  # 배포 미리보기
./scripts/docker-hub-deploy.sh          # 배포
./scripts/test-docker-hub.sh            # 배포 검증
```

## 🐳 Docker 명령어

### 기본 명령어
```bash
# 로컬 빌드로 서비스 시작
docker-compose up -d

# Docker Hub 이미지로 서비스 시작
docker-compose -f docker-compose-hub.yml up -d

# 서비스 중지
docker-compose down

# 완전 정리 (볼륨 포함)
docker-compose down --volumes --remove-orphans
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f frontend
docker-compose logs -f auth-service
docker-compose logs -f api-service
```

## 🔍 모니터링 및 디버깅

### 헬스 체크
```bash
# 인증 서비스
curl http://localhost:3001/health

# Rust API 서비스
curl http://localhost:8080/health

# 데이터베이스
docker-compose exec postgres pg_isready -U coffee_user

# Redis
docker-compose exec redis redis-cli ping
```

### 서비스 상태 확인
```bash
# 컨테이너 상태
docker-compose ps

# 리소스 사용량
docker stats

# 네트워크 확인
docker network ls
```

## 🚀 프로덕션 배포

### 프로덕션 환경 설정
```bash
# 1. 환경 변수 설정
export NODE_ENV=production
export RUST_LOG=warn

# 2. 보안 키 생성
export JWT_SECRET=$(openssl rand -base64 64)
export POSTGRES_PASSWORD=$(openssl rand -base64 32)

# 3. Docker Hub 이미지로 배포
docker-compose -f docker-compose-hub.yml up -d
```

### 보안 체크리스트
- [ ] 기본 패스워드 변경
- [ ] JWT 시크릿 업데이트
- [ ] CORS 오리진 설정
- [ ] 방화벽 규칙 설정
- [ ] SSL/TLS 인증서 설정
- [ ] 로그 모니터링 설정

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- 코드 변경 시 테스트 추가
- 커밋 메시지는 명확하게 작성
- 문서 업데이트 포함
- 스크립트 실행으로 검증

## 📄 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 🆘 문제 해결

### 일반적인 문제

#### 1. 서비스가 시작되지 않는 경우
```bash
# Docker 데몬 확인
docker info

# 포트 충돌 확인
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :8080

# 로그 확인
docker-compose logs
```

#### 2. 데이터베이스 연결 문제
```bash
# PostgreSQL 상태 확인
docker-compose exec postgres pg_isready -U coffee_user

# 연결 테스트
docker-compose exec postgres psql -U coffee_user -d coffee_counter -c "SELECT 1;"

# 로그 확인
docker-compose logs postgres
```

#### 3. 인증 문제
```bash
# JWT 시크릿 확인
docker-compose exec auth-service env | grep JWT_SECRET

# 인증 서비스 로그
docker-compose logs auth-service

# API 서비스 로그
docker-compose logs api-service
```

#### 4. Docker Hub 배포 문제
```bash
# Docker Hub 로그인 확인
docker login

# 환경 변수 확인
echo $DOCKER_HUB_USERNAME
echo $PROJECT_NAME

# 이미지 존재 확인
docker images | grep coffee-counter
```

### 성능 최적화

#### 메모리 사용량 최적화
```bash
# 사용하지 않는 이미지 정리
docker image prune -a

# 사용하지 않는 볼륨 정리
docker volume prune

# 전체 시스템 정리
docker system prune -a
```

#### 로그 관리
```bash
# 로그 크기 제한 설정
docker-compose logs --tail=100 -f

# 로그 파일 정리
docker-compose down
docker system prune -a
```

## 📞 지원

### 문제 신고
- **GitHub Issues**: [프로젝트 저장소]/issues
- **이메일**: support@coffee-counter.com

### 커뮤니티
- **Discord**: [커뮤니티 링크]
- **문서**: [문서 사이트]

---

**React, Node.js, Rust, PostgreSQL, Docker로 ❤️를 담아 제작되었습니다**
