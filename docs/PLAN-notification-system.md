# 알림 시스템 개편 작업 히스토리

> Branch: `feat/notification-system-overhaul`
> Issue: #47, #48 (이전: #40)
> 최종 업데이트: 2026-03-18

---

## 목표

이벤트(일정), 할 일(Todo), 습관(Habit) 3가지 타입에 대해 **Web Push 알림**을 지원한다.
iPhone Safari PWA 환경에서도 정상 동작해야 한다.

---

## 아키텍처

```
┌─────────────┐    매분 실행     ┌─────────────────────────────┐
│  Supabase   │ ──pg_cron────▶  │  /api/cron/notify (Vercel)  │
│  pg_cron    │    pg_net        │  - sendEventNotifications   │
│  (jobid=2)  │                  │  - sendHabitNotifications    │
└─────────────┘                  │  - sendTodoNotifications     │
                                 └──────────┬──────────────────┘
                                            │ web-push (VAPID)
                                            ▼
                                 ┌─────────────────────────────┐
                                 │  Push Service               │
                                 │  - FCM (Chrome/Android)     │
                                 │  - APNs (Safari/iOS)        │
                                 └──────────┬──────────────────┘
                                            │
                                            ▼
                                 ┌─────────────────────────────┐
                                 │  Service Worker (sw.js)     │
                                 │  → showNotification()       │
                                 └─────────────────────────────┘
```

### 주요 파일

| 파일 | 역할 |
|------|------|
| `apps/web/app/api/cron/notify/route.ts` | 크론 알림 API (이벤트/습관/할일) |
| `apps/web/app/api/push/subscribe/route.ts` | 푸시 구독 저장/삭제 API |
| `apps/web/public/sw.js` | Service Worker - 푸시 수신 및 알림 표시 |
| `packages/core/src/hooks/usePushNotification.ts` | 클라이언트 푸시 구독 관리 훅 |
| `apps/web/app/register-sw.tsx` | SW 등록 컴포넌트 |
| `apps/web/app/settings/page.tsx` | 알림 설정 UI (토글) |

### DB 테이블

- `push_subscriptions`: user_id, endpoint, p256dh, auth
- `user_settings`: notifications_events, notifications_todos, notifications_habits, timezone
- `events`: reminder_mins (integer[]) - 복수 알람 지원
- `habits`: reminder_time (HH:mm), frequency, frequency_config
- `todos`: reminder_at (timestamptz) - 1회성 알림

---

## 작업 히스토리

### Phase 1: 기본 알림 인프라 (#40)

1. **iOS PWA 알림 기능 구현** (`2e4ba41`)
   - usePushNotification 훅 생성
   - SW 등록, 푸시 구독 플로우 구축

2. **알림 토글 + push subscription 연동** (`4abe96f`, `b090569`)
   - 설정 페이지에서 토글 ON → push 구독, 전부 OFF → 구독 해제
   - push 구독 실패 시에도 user_settings 저장은 진행하도록 수정

3. **iOS PWA 호환성 수정** (`7bf0a28`)
   - denied 시 OFF 허용
   - iOS PWA에서 Notification 객체 없을 때 PushManager 폴백

4. **next-pwa 제거, 수동 SW 등록** (`dcae62c`)
   - next-pwa 의존성 제거
   - register-sw.tsx에서 직접 `/sw.js` 등록
   - SW 등록 경합 해소 (`eb8be6b`)

5. **Vercel Cron → Supabase pg_cron 전환** (`5b67efa` → `a72e342`)
   - vercel.json cron 설정 추가 후, pg_cron + pg_net 방식으로 최종 전환

### Phase 2: 알림 시스템 전면 개편 (#47)

6. **알림 시스템 전면 개편** (`3e79901`)
   - 일정: `reminder_mins integer[]` 복수 알람 지원
   - 습관: `reminder_time` + frequency 기반 알림
   - 할 일: `reminder_at` 1회성 알림 (발송 후 null 처리)
   - 유저별 timezone 지원, 알림 타입별 on/off

7. **Supabase 클라이언트 빌드 타임 초기화 오류 수정** (`266d69b`)

8. **schema.sql 동기화 + 마이그레이션 파일 추가** (`cc9c814`)

9. **TodoModal reminder_at 포맷 변환** (`533081a`)
   - ISO 8601 → datetime-local 포맷 변환

### Phase 3: iOS Safari 푸시 디버깅 (현재 진행 중)

**증상**: API에서 `events:2` 반환 (web-push 에러 없음) → iPhone에서 알림 미수신

10. **pg_cron URL 수정**
    - 잘못된 URL이 설정되어 있던 것 수정

11. **알림 타이밍 검증**
    - 60초 알람 윈도우 동작 확인 (`nowMs >= alarmTimeMs && nowMs < alarmTimeMs + 60000`)
    - `reminder_mins=[0]` + `start_at=NOW()` 테스트로 즉시 알람 검증

12. **iOS Safari PWA 호환성 수정** (2026-03-18, 미배포)
    - `sw.js`: `requireInteraction: true` 제거 → iOS Safari 미지원으로 showNotification() 조용히 실패
    - `usePushNotification.ts`: `applicationServerKey` 전달 방식 개선 (buffer.slice(0))
    - `manifest.json`: icon purpose `"any maskable"` → `"any"` + `"maskable"` 분리

---

## 알려진 이슈 (미수정)

코드 리뷰에서 발견된 8가지 개선 사항:

1. ~~`staleEndpoints` shared array in Promise.all~~ → 각 함수가 자체 staleEndpoints 반환하도록 수정 완료
2. `shouldSendHabitToday` - frequency 타입별 dead code 가능성
3. `localTimeToUtcMs` - timezone 유효성 검증 (fallback 추가 완료)
4. ~~`reminder_mins` 중복 제거~~ → `new Set()` 적용 완료
5. `getSupabaseAdmin()` 매번 새 인스턴스 생성 → 싱글톤 패턴 필요
6. 클라이언트/서버 간 notification tag 불일치 가능성
7. ~~Todo `reminder_at` null 처리~~ → 발송 성공한 todo만 null 처리하도록 수정 완료
8. 각 send 함수에 top-level try/catch 추가 필요 (현재 있음, 검증 완료)

---

## 다음 단계

- [ ] Phase 3 수정 사항 배포 후 iPhone에서 검증
  - PWA 삭제 → 재설치 (SW 캐시 초기화)
  - 알림 토글 다시 활성화 (새 구독 생성)
  - 테스트 이벤트로 push 수신 확인
- [ ] FCM(Chrome) 구독 삭제 후 Apple-only 테스트로 격리 검증
- [ ] Vercel 로그에서 Apple endpoint push 에러 확인
- [ ] getSupabaseAdmin() 싱글톤 패턴 적용
- [ ] 이벤트 알람 옵션 확대 (현재 reminder_mins 선택지 UI 개선)
