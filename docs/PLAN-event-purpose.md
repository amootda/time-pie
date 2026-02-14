# 약속 유형 (Event Purpose) 추가 계획

## Context

현재 EventModal에서 "카테고리"라는 이름으로 색상만 선택하는 UI가 있음 (업무, 개인, 미팅, 운동, 수면, 식사). 하지만 이 선택이 DB에 의미 있게 저장되지 않고 `color` 값만 반영됨. `category_id`는 항상 `null`.

사용자가 원하는 것: 일정 추가 시 목적별 분류(약속 유형)를 이모지+라벨로 선택하고, 해당 정보가 DB에 저장되어 이벤트 표시 시에도 보이도록 하는 것.

## 접근 방식

`events` 테이블에 `purpose TEXT` 컬럼을 추가하고, 기존 색상 피커를 이모지가 포함된 약속 유형 선택기로 교체.

- `event_type` (고정/유동/반복) = 일정의 **스케줄 방식**
- `purpose` (업무/미팅/약속/운동 등) = 일정의 **목적** (새로 추가)

## 변경 파일 및 상세

### 1. DB 스키마: `packages/supabase/schema.sql`

events 테이블에 `purpose` 컬럼 추가 (line 28 뒤):
```sql
purpose TEXT CHECK (purpose IN ('work','meeting','appointment','personal','exercise','study','meal','sleep','commute','hobby','other')),
```
- nullable (기존 이벤트 호환)
- CHECK constraint로 유효값 제한

### 2. 타입: `packages/supabase/src/types.ts`

- `EventPurpose` 타입 추가: `'work' | 'meeting' | ... | 'other'`
- `Event` 인터페이스에 `purpose: EventPurpose | null` 필드 추가 (line 35 뒤)
- `EventInsert`, `EventUpdate`는 Omit/Partial 기반이라 자동 반영

### 3. 상수 정의: `packages/core/src/constants/purposes.ts` (새 파일)

```typescript
export const EVENT_PURPOSES = [
  { key: 'work',        label: '업무', emoji: '💼', color: '#4A90D9' },
  { key: 'meeting',     label: '미팅', emoji: '🤝', color: '#9B59B6' },
  { key: 'appointment', label: '약속', emoji: '📅', color: '#E67E22' },
  { key: 'personal',    label: '개인', emoji: '🏠', color: '#2ECC71' },
  { key: 'exercise',    label: '운동', emoji: '🏃', color: '#E74C3C' },
  { key: 'study',       label: '공부', emoji: '📚', color: '#3498DB' },
  { key: 'meal',        label: '식사', emoji: '🍽️', color: '#F39C12' },
  { key: 'sleep',       label: '수면', emoji: '🌙', color: '#34495E' },
  { key: 'commute',     label: '이동', emoji: '🚗', color: '#95A5A6' },
  { key: 'hobby',       label: '취미', emoji: '🎨', color: '#1ABC9C' },
  { key: 'other',       label: '기타', emoji: '📌', color: '#7F8C8D' },
]
```
- `getPurposeInfo(key)` 헬퍼 함수 포함
- `packages/core/src/index.ts`에서 export 추가

### 4. EventModal UI: `apps/web/app/components/EventModal.tsx`

- `COLORS` 배열 제거 (line 16-23)
- `purpose` 상태 추가, `color`는 purpose 선택 시 자동 설정
- 기존 "카테고리" 색상 피커 (line 188-207) → "약속 유형" 이모지 그리드로 교체
  - `grid grid-cols-4 gap-2` 레이아웃
  - 각 버튼: 이모지 + 한글 라벨
  - 활성 상태: `border-primary bg-primary/10` (기존 event_type 패턴과 동일)
- `handleSubmit`에 `purpose` 포함 (line 73-83)
- `useEffect` 리셋에 `purpose` 포함 (line 42-56)

### 5. 이벤트 표시: `apps/web/app/page.tsx`

- 파이차트 Legend (line 206-225): 이벤트 제목 앞에 purpose 이모지 표시
- 리스트 뷰 (line 236-276): 이벤트 제목 앞에 purpose 이모지 표시
- `getPurposeInfo` import 추가

### 변경 불필요 파일

- `packages/supabase/src/queries/events.ts`: `select('*')` 사용 → purpose 자동 포함
- `packages/core/src/stores/eventStore.ts`: Event 타입 자동 반영
- `packages/core/src/hooks/useUserData.ts`: EventInsert 전달만 함
- `apps/mobile/`: WebView 래퍼 → 웹 변경사항 자동 반영

## 구현 순서

1. `schema.sql` - purpose 컬럼 추가
2. `types.ts` - EventPurpose 타입 + Event에 purpose 필드
3. `purposes.ts` 새 파일 + core index export
4. `EventModal.tsx` - 색상 피커 → 약속 유형 선택기
5. `page.tsx` - 이벤트 표시에 이모지 추가

## 검증 방법

1. `pnpm build` (apps/web) - 타입 에러 없는지 확인
2. EventModal에서 약속 유형 선택 후 저장 → DB에 purpose 값 저장 확인
3. 홈 파이차트/리스트에서 이모지 표시 확인
4. purpose 미선택 시 null로 저장되어 기존 이벤트와 호환 확인
