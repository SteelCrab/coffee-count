# ⚛️ 커피 카운터 프론트엔드

Coffee Counter Microservices의 React 기반 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

## 🛠️ 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **React Router** - 클라이언트 사이드 라우팅
- **Axios** - HTTP 클라이언트
- **Lucide React** - 아이콘 라이브러리

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── categories/     # 카테고리 관련 컴포넌트
│   └── counters/       # 카운터 관련 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 React 훅
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── styles/             # 전역 스타일
```

## 🎨 UI 컴포넌트

### 기본 컴포넌트
- **Button** - 다양한 스타일의 버튼
- **Input** - 폼 입력 필드
- **Card** - 카드 레이아웃
- **Modal** - 모달 다이얼로그
- **Loading** - 로딩 스피너

### 비즈니스 컴포넌트
- **CategoryCard** - 카테고리 표시 카드
- **CounterButton** - 카운터 증가 버튼
- **StatisticsChart** - 통계 차트
- **DatePicker** - 날짜 선택기

## 🔌 API 통합

### 서비스 구조
```typescript
// services/api.ts
export const authApi = axios.create({
  baseURL: process.env.REACT_APP_AUTH_SERVICE_URL,
});

export const dataApi = axios.create({
  baseURL: process.env.REACT_APP_API_SERVICE_URL,
});
```

### 인증 서비스 (포트 3001)
```typescript
// 사용자 등록
await authApi.post('/api/auth/register', userData);

// 로그인
await authApi.post('/api/auth/login', credentials);

// 토큰 갱신
await authApi.post('/api/auth/refresh');
```

### 데이터 서비스 (포트 8080)
```typescript
// 카테고리 조회
await dataApi.get('/api/categories');

// 카운터 데이터 추가
await dataApi.post('/api/counters', counterData);

// 통계 조회
await dataApi.get('/api/counters/range', { params: dateRange });
```

## 🎯 주요 기능

### 인증 시스템
- 사용자 등록 및 로그인
- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 보호된 라우트

### 카테고리 관리
- 카테고리 생성, 수정, 삭제
- 아이콘 및 색상 커스터마이징
- 단위 및 기본값 설정

### 카운터 기능
- 원클릭 카운터 증가
- 사용자 정의 수량 입력
- 메모 추가
- 일별 통계 확인

### 데이터 시각화
- 일별/주별/월별 통계
- 차트 및 그래프
- 데이터 내보내기

## 🎨 스타일링

### Tailwind CSS 설정
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
      },
    },
  },
  plugins: [],
};
```

### 커스텀 CSS 클래스
```css
/* src/styles/globals.css */
.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90;
}

.card {
  @apply bg-white rounded-lg shadow-md p-4;
}
```

## 🔧 환경 설정

### 환경 변수 (.env)
```env
# API 설정
REACT_APP_AUTH_SERVICE_URL=http://localhost:3001
REACT_APP_API_SERVICE_URL=http://localhost:8080

# 애플리케이션 설정
REACT_APP_APP_NAME=Coffee Counter
REACT_APP_VERSION=1.0.0

# 기능 플래그
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

## 🧪 테스트

### 테스트 구조
```
src/
├── __tests__/          # 테스트 파일
├── components/
│   └── __tests__/      # 컴포넌트 테스트
└── services/
    └── __tests__/      # 서비스 테스트
```

### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 커버리지 포함 테스트
npm test -- --coverage

# 특정 파일 테스트
npm test Button.test.tsx
```

## 📱 반응형 디자인

### 브레이크포인트
- **sm**: 640px 이상 (모바일)
- **md**: 768px 이상 (태블릿)
- **lg**: 1024px 이상 (데스크톱)
- **xl**: 1280px 이상 (대형 화면)

### 모바일 최적화
- 터치 친화적 UI
- 스와이프 제스처 지원
- 오프라인 기능 (PWA)

## 🚀 성능 최적화

### 코드 분할
```typescript
// 지연 로딩
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Statistics = lazy(() => import('./pages/Statistics'));
```

### 메모이제이션
```typescript
// React.memo 사용
export const CategoryCard = memo(({ category }) => {
  // 컴포넌트 로직
});

// useMemo 사용
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

## 🔒 보안

### XSS 방지
- 사용자 입력 검증
- HTML 이스케이핑
- CSP 헤더 설정

### CSRF 방지
- CSRF 토큰 사용
- SameSite 쿠키 설정

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
# 빌드 생성
npm run build

# 빌드 미리보기
npm run preview
```

### Docker 배포
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 개발 도구

### VS Code 확장
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter

### 개발 스크립트
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src/**/*.{ts,tsx}"
  }
}
```

## 🐛 디버깅

### React Developer Tools
- 컴포넌트 트리 검사
- Props 및 State 확인
- 성능 프로파일링

### 네트워크 디버깅
```typescript
// API 요청 로깅
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

## 📚 추가 리소스

### 문서
- [React 공식 문서](https://reactjs.org/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

### 커뮤니티
- [React 커뮤니티](https://reactjs.org/community/support.html)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)

---

**React와 TypeScript로 ❤️를 담아 제작되었습니다**
