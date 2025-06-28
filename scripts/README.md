# 🔧 스크립트 디렉토리

이 디렉토리에는 Coffee Counter Microservices 프로젝트의 모든 빌드, 배포 및 테스트 스크립트가 포함되어 있습니다.

## 📜 사용 가능한 스크립트

### 빌드 및 개발
- **`build.sh`** - 모든 서비스를 위한 메인 빌드 스크립트
- **`test.sh`** - 모든 서비스를 위한 종합 테스트 스크립트

### Docker Hub 배포
- **`docker-hub-deploy.sh`** - 모든 서비스를 Docker Hub에 배포
- **`docker-hub-deploy-dry-run.sh`** - 실행하지 않고 Docker Hub 배포 미리보기
- **`test-docker-hub.sh`** - Docker Hub 이미지 기능 테스트

## 🚀 사용 예시

### 개발
```bash
# 모든 서비스 빌드
./scripts/build.sh

# 모든 테스트 실행
./scripts/test.sh
```

### Docker Hub 배포
```bash
# Docker Hub에 배포
./scripts/docker-hub-deploy.sh

# 배포 테스트 (드라이 런)
./scripts/docker-hub-deploy-dry-run.sh

# Docker Hub 이미지 테스트
./scripts/test-docker-hub.sh
```

## 📋 스크립트 권한

모든 스크립트는 실행 가능합니다. 권한 문제가 발생하면 다음을 실행하세요:
```bash
chmod +x scripts/*.sh
```

## 🔗 관련 문서

- [메인 README](../README.md) - 프로젝트 설정 및 개요
- [Docker Hub 가이드](../docs/DOCKER_HUB.md) - 상세한 Docker Hub 배포 지침
