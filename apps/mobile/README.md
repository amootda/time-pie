# Time Pie Mobile App

React Native (Expo) 기반 모바일 앱입니다. WebView를 통해 웹 앱을 렌더링합니다.

## 시작하기

### 개발 환경 설정

```bash
# 루트 디렉토리에서
pnpm install

# 웹 앱 먼저 실행 (별도 터미널)
pnpm dev:web

# 모바일 앱 실행
pnpm mobile:start
```

### 실행 방법

```bash
# Expo Go로 실행
pnpm mobile:start

# iOS 시뮬레이터
pnpm mobile:ios

# Android 에뮬레이터
pnpm mobile:android
```

## 프로젝트 구조

```
apps/mobile/
├── app/                    # Expo Router 페이지
│   ├── _layout.tsx        # 루트 레이아웃
│   └── index.tsx          # 메인 WebView 화면
├── src/
│   ├── config/            # 설정 파일
│   │   └── constants.ts   # 상수 정의
│   └── hooks/             # 커스텀 훅
│       └── useWebViewBridge.ts
├── assets/                # 앱 아이콘, 스플래시 등
├── app.json              # Expo 설정
├── eas.json              # EAS Build 설정
└── package.json
```

## 주요 기능

### WebView 통합
- 웹 앱을 WebView로 렌더링
- OAuth 인증 지원 (Kakao, Google)
- 딥링크 스킴: `timepie://`

### 네이티브 기능
- SafeArea 지원
- Android 뒤로가기 버튼 처리
- 스플래시 스크린
- 상태바 관리

## 빌드

### EAS Build 사용

```bash
# 개발 빌드
eas build --platform all --profile development

# 프리뷰 빌드 (APK)
eas build --platform android --profile preview

# 프로덕션 빌드
eas build --platform all --profile production
```

## 설정

### 웹 앱 URL 변경

[src/config/constants.ts](src/config/constants.ts)에서 `WEB_APP_URL`을 수정하세요:

```typescript
export const WEB_APP_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-url.com'
```

### 앱 정보 변경

[app.json](app.json)에서 앱 이름, 번들 ID 등을 수정하세요.
