# 🐳 Docker Hub 배포 가이드

이 가이드는 Coffee Counter Microservices를 Docker Hub에 배포하고 사용하는 방법을 설명합니다.

## 🚀 빠른 시작 (사용자용)

### 사전 빌드된 이미지로 즉시 실행

```bash
# 저장소 클론
git clone <repository>
cd coffee-counter-microservices

# Docker Hub 이미지로 실행
docker-compose -f docker-compose-hub.yml up -d
```

### 서비스 접속
- **프론트엔드**: http://localhost:3000
- **인증 서비스**: http://localhost:3001
- **API 서비스**: http://localhost:8080

## 📦 사용 가능한 이미지

### 공식 이미지
- **프론트엔드**: `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:latest`
- **인증 서비스**: `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service:latest`
- **API 서비스**: `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-api-service:latest`

### 이미지 크기
- **프론트엔드**: ~80.9MB (Nginx + React 빌드)
- **인증 서비스**: ~236MB (Node.js + 의존성)
- **API 서비스**: ~196MB (Rust 바이너리 + 런타임)

## 🔧 개발자용 배포

### 1. Docker Hub 로그인
```bash
docker login
```

### 2. 환경 변수 설정
```bash
# Docker Hub 사용자명 설정
export DOCKER_HUB_USERNAME=your-username

# 또는 .env 파일에서 설정
echo "DOCKER_HUB_USERNAME=your-username" >> .env
echo "PROJECT_NAME=your-project-name" >> .env
```

### 3. 배포 실행
```bash
# 전체 배포 (빌드 + 푸시)
./scripts/docker-hub-deploy.sh

# 미리보기 (실제 푸시 없이)
./scripts/docker-hub-deploy-dry-run.sh
```

### 4. 배포 확인
```bash
# Docker Hub 이미지 테스트
./scripts/test-docker-hub.sh
```

## 📋 배포 스크립트 상세

### `docker-hub-deploy.sh`
- 모든 서비스 이미지 빌드
- 태그 생성 (latest + 타임스탬프)
- Docker Hub에 푸시
- 배포 요약 출력

### `docker-hub-deploy-dry-run.sh`
- 배포 과정 시뮬레이션
- 실제 푸시 없이 명령어 출력
- 배포 전 검증용

### `test-docker-hub.sh`
- Docker Hub 이미지 다운로드
- 서비스 시작 테스트
- 헬스 체크 수행
- 정리 작업

## 🏷️ 태그 전략

### 자동 태그
- **`latest`** - 최신 안정 버전
- **`v1.0.0-YYYYMMDD-HHMMSS`** - 타임스탬프 버전

### 수동 태그 (선택사항)
```bash
# 특정 버전 태그
docker tag ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:latest ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:v1.0.0
docker push ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:v1.0.0
```

## 🔄 CI/CD 자동화

### GitHub Actions 워크플로우
`.github/workflows/docker-hub-deploy.yml`이 설정되어 있어 `main` 브랜치에 푸시하면 자동으로 배포됩니다.

### 필요한 GitHub Secrets
```
DOCKER_HUB_USERNAME - Docker Hub 사용자명
DOCKER_HUB_TOKEN - Docker Hub 액세스 토큰
```

### Secrets 설정 방법
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. New repository secret 클릭
3. 위의 secrets 추가

## 🌍 프로덕션 배포

### 1. 환경별 설정
```bash
# 프로덕션 환경 변수
export NODE_ENV=production
export RUST_LOG=warn
```

### 2. 보안 설정
```bash
# JWT 시크릿 변경
export JWT_SECRET=$(openssl rand -base64 64)

# 데이터베이스 패스워드 변경
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

### 3. 프로덕션 배포
```bash
# 프로덕션용 compose 파일 사용
docker-compose -f docker-compose-hub.yml -f docker-compose.prod.yml up -d
```

## 🔍 모니터링 및 로그

### 헬스 체크
```bash
# 모든 서비스 상태 확인
curl http://localhost:3001/health  # 인증 서비스
curl http://localhost:8080/health  # API 서비스
```

### 로그 확인
```bash
# 실시간 로그
docker-compose -f docker-compose-hub.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose-hub.yml logs -f frontend
```

### 리소스 모니터링
```bash
# 컨테이너 리소스 사용량
docker stats

# 이미지 크기 확인
docker images | grep yongcoffee
```

## 🛠️ 문제 해결

### 일반적인 문제

#### 1. 이미지 다운로드 실패
```bash
# Docker Hub 연결 확인
docker pull hello-world

# 네트워크 문제 확인
ping hub.docker.com
```

#### 2. 권한 문제
```bash
# Docker Hub 로그인 확인
docker login

# 토큰 재생성
# Docker Hub → Account Settings → Security → New Access Token
```

#### 3. 서비스 시작 실패
```bash
# 포트 충돌 확인
netstat -tulpn | grep :3000

# 로그 확인
docker-compose -f docker-compose-hub.yml logs [서비스명]
```

### 디버깅 명령어
```bash
# 컨테이너 내부 접속
docker-compose -f docker-compose-hub.yml exec frontend sh
docker-compose -f docker-compose-hub.yml exec auth-service bash

# 네트워크 확인
docker network ls
docker network inspect coffee-counter-microservices_default
```

## 📊 성능 최적화

### 이미지 크기 최적화
- 멀티 스테이지 빌드 사용
- Alpine Linux 베이스 이미지
- 불필요한 파일 제거

### 캐시 최적화
```bash
# 빌드 캐시 사용
docker-compose build --parallel

# 이미지 레이어 캐시
docker buildx build --cache-from=type=registry,ref=${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:cache
```

## 🔐 보안 모범 사례

### 이미지 보안
- 정기적인 베이스 이미지 업데이트
- 취약점 스캔 실행
- 최소 권한 원칙 적용

### 런타임 보안
```bash
# 읽기 전용 루트 파일시스템
docker run --read-only ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend

# 비특권 사용자 실행
docker run --user 1000:1000 ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service
```

## 📈 확장성

### 수평 확장
```bash
# 서비스 복제
docker-compose -f docker-compose-hub.yml up -d --scale auth-service=3 --scale api-service=2
```

### 로드 밸런싱
- Nginx 리버스 프록시 설정
- Docker Swarm 또는 Kubernetes 사용

## 🔄 업데이트 전략

### 롤링 업데이트
```bash
# 새 이미지 배포
docker-compose -f docker-compose-hub.yml pull
docker-compose -f docker-compose-hub.yml up -d --no-deps --build [서비스명]
```

### 블루-그린 배포
```bash
# 새 환경 시작
docker-compose -f docker-compose-hub.yml -p coffee-counter-green up -d

# 트래픽 전환 후 이전 환경 정리
docker-compose -f docker-compose-hub.yml -p coffee-counter-blue down
```

## 📞 지원

### 문제 신고
- GitHub Issues: [프로젝트 저장소]/issues
- 이메일: support@coffee-counter.com

### 커뮤니티
- Discord: [커뮤니티 링크]
- 문서: [문서 사이트]

---

**Docker Hub를 통한 쉽고 안정적인 배포를 경험해보세요! 🚀**
