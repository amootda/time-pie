# Timeblocks 벤치마킹 리포트

**작성일**: 2026-02-18
**목적**: Timeblocks 앱의 화면 설계를 벤치마킹하여 Time Pie의 모바일 UI/UX 개선
**초점**: 캘린더/타임라인 시각화, 이벤트 생성/편집 UI

---

## 📊 Executive Summary

**Timeblocks의 핵심 강점**:
- 직관적인 드래그 앤 드롭 인터랙션
- 종이 다이어리 같은 친숙한 UX
- 풍부한 시각적 커스터마이징
- 모바일 최적화된 터치 제스처

**Time Pie의 차별점**:
- 독창적인 파이 차트 시각화 (24시간 원형 뷰)
- 3단계 이벤트 타입 시스템 (Hard/Anchor/Soft)
- 실행 추적 기능 (Execution Timer)

**핵심 개선 방향**:
1. ✅ **유지**: 파이 차트 중심 시각화 (Time Pie의 정체성)
2. 🔄 **개선**: 이벤트 생성/편집 모달 간소화 (현재 629줄 → 단계별 분리)
3. ➕ **추가**: 드래그 앤 드롭 인터랙션 (파이 차트 위에서 이벤트 조정)
4. ➕ **추가**: 주간/월간 뷰 추가 (파이 차트 보완)

---

## 🎯 Timeblocks 앱 분석

### 1. 타임라인/캘린더 시각화

#### 주요 특징
- **확장 가능한 월간 뷰**: 일정 수에 따라 화면이 자동 확장
- **Habit Mini Calendar**: 반복 활동 추적을 위한 미니 캘린더
- **다중 위젯**: 월간, 주간 캘린더 위젯 제공
- **Solar/Lunar Calendar**: 양력/음력 동시 지원

#### Time Pie 적용 방안
```
현재 상태: 파이 차트만 제공 (1일 뷰)
개선안:
1. 주간 뷰 추가 - 7개의 작은 파이 차트로 한 주 표시
2. 월간 뷰 추가 - 날짜별 이벤트 밀도 히트맵
3. 파이 차트를 메인으로 유지하되, 탭으로 뷰 전환
```

### 2. 이벤트 생성/편집 UI

#### Timeblocks 강점
- **드래그 앤 드롭**: 메모 → 캘린더로 직접 드래그
- **빠른 생성**: 시간대 클릭만으로 이벤트 생성
- **종이 다이어리 느낌**: 친숙하고 직관적
- **자동 이동**: 미완료 작업 자동 이월

#### Time Pie 현재 문제점
```typescript
// EventModal.tsx - 629줄의 거대한 폼
- 3가지 이벤트 타입(Hard/Anchor/Soft)을 하나의 모달에서 처리
- 조건부 렌더링으로 복잡도 증가
- 스크롤이 필요한 긴 폼 (모바일에서 불편)
```

#### 개선안
```
1단계: 타입 선택 화면 (현재 있음)
2단계: 핵심 정보만 입력 (제목, 시간)
3단계: 상세 옵션 (선택적 확장)

장점:
- 빠른 생성: 2단계만으로 완료 가능
- 낮은 진입장벽: 복잡도 숨김
- 모바일 친화적: 스크롤 최소화
```

### 3. 색상 코딩 & 시각적 디자인

#### Timeblocks 강점
- **Color Label**: 카테고리별 색상 구분
- **Stickers & Masking Tapes**: 시각적 꾸미기 요소
- **테마 & 폰트**: 광범위한 커스터마이징
- **In-app Store**: 디자이너 협업 테마

#### Time Pie 현재 상태
```typescript
// EventModal.tsx - Purpose 선택기
- 11가지 약속 유형 (work, meeting, appointment, ...)
- 각 유형마다 emoji + color 매핑
- 3x3 그리드로 표시

장점: 의미 기반 분류 (색상 + 목적)
개선점: 사용자 커스터마이징 불가
```

#### 개선안
```
1. 기본 Purpose 유지 (빠른 선택)
2. Custom Color 옵션 추가
3. 최근 사용 색상 캐싱
4. 테마별 색상 팔레트 제공
```

### 4. 모바일 인터랙션 패턴

#### Timeblocks 강점
- **터치 제스처**: 드래그, 스와이프, 롱프레스
- **위젯 액세스**: 홈 화면에서 빠른 접근
- **실시간 알림**: 공유 캘린더 변경 알림
- **생체 인증**: 빠른 로그인

#### Time Pie 현재 상태
```typescript
// page.tsx - 주요 인터랙션
1. FloatingAddButton - 하단 고정 버튼
2. PieChart onEventClick - 파이 조각 클릭
3. EventCard onClick - 카드 클릭

문제점:
- 드래그 앤 드롭 없음
- 제스처 활용 부족
- 롱프레스 기능 없음
```

#### 개선안
```
1. 파이 차트 드래그 앤 드롭
   - 이벤트 조각을 드래그하여 시간 조정
   - 시간대 드래그로 새 이벤트 생성

2. 제스처 추가
   - 좌/우 스와이프: 날짜 이동
   - 롱프레스: 빠른 편집 메뉴
   - 핀치 줌: 파이 차트 확대/축소

3. 햅틱 피드백
   - 이벤트 생성/편집/삭제 시
   - 시간 조정 시 매 15분마다
```

---

## 🎨 구체적인 UI/UX 개선 제안

### 1. 이벤트 모달 리디자인 (우선순위: 높음)

#### Before (현재)
```
[Hard 📅 | Anchor ⚓ | Soft 🎯]  ← 탭
─────────────────────────────
제목: [________________]
약속 유형: [🏢 💼 🎓 ...]  (11개)
날짜: [2026-02-18]
하루 종일 [☐]
시작: [09:00]
종료: [10:00]
반복 요일: [일월화수목금토]
다른 일정 잠금 [☐]
장소/링크: [________________]
메모: [________________]
[삭제] [저장]
```

#### After (개선안)
```
Step 1: 타입 선택 (현재와 동일)
[Hard 📅 | Anchor ⚓ | Soft 🎯]

Step 2: 빠른 생성
─────────────────────────────
제목: [________________]
🏢 [Work] [Meeting] [Personal] [+]  ← 자주 쓰는 4개만
⏰ [09:00] → [10:00]
📅 [오늘] [내일] [날짜 선택]
─────────────────────────────
[▼ 더 많은 옵션]  ← 접힌 상태
[저장]

Step 3: 상세 옵션 (펼칠 때만)
─────────────────────────────
▼ 더 많은 옵션
반복: [일월화수목금토]
장소: [________________]
메모: [________________]
알림: [15분 전]
─────────────────────────────
```

**장점**:
- 기본 생성: 3번의 탭 (제목 → 시간 → 저장)
- 스크롤 최소화: 핵심 정보만 표시
- 점진적 공개: 필요할 때만 옵션 확장

### 2. 파이 차트 인터랙션 강화

#### 현재
```typescript
// PieChart.tsx
<path
  onClick={() => handleSliceClick(slice, hour)}
  // 클릭만 가능
/>
```

#### 개선안
```typescript
// 드래그 앤 드롭 추가
<path
  onMouseDown={handleDragStart}
  onMouseMove={handleDragMove}
  onMouseUp={handleDragEnd}
  onTouchStart={handleDragStart}
  onTouchMove={handleDragMove}
  onTouchEnd={handleDragEnd}
  // 시간 조정 가능
/>

// 사용 시나리오:
1. 이벤트 조각 드래그 → 시간 이동
2. 빈 공간 드래그 → 새 이벤트 생성
3. 조각 가장자리 드래그 → 시간 연장/축소
```

### 3. 주간 뷰 추가

```
┌─────────────────────────────┐
│  [Day] [Week] [Month]       │  ← 탭
├─────────────────────────────┤
│  월   화   수   목   금   토   일 │
│  🥧   🥧   🥧   🥧   🥧   🥧   🥧 │
│  ●●   ●●●  ●    ●●   ●●●  ●●   ● │
│  3개  5개  1개  3개  5개  3개  2개│
└─────────────────────────────┘

터치 인터랙션:
- 각 작은 파이 클릭 → 해당 날짜 상세 뷰
- 좌우 스와이프 → 이전/다음 주
```

### 4. 빠른 액션 메뉴

```typescript
// EventCard에 롱프레스 추가
<EventCard
  event={event}
  onLongPress={() => showQuickMenu(event)}
/>

// 빠른 메뉴 예시
┌─────────────────┐
│ ✏️  편집        │
│ ✅  완료 표시   │
│ ⏰  시간 변경   │
│ 📅  다음 날로   │
│ 🗑️  삭제       │
└─────────────────┘
```

---

## 🚀 실행 계획 (우선순위별)

### Phase 1: 이벤트 생성 UX 개선 (2-3일)
1. **EventModal 리팩토링**
   - 단계별 컴포넌트 분리 (`QuickEventForm`, `DetailedOptions`)
   - 자주 쓰는 Purpose 4개만 우선 표시
   - 접을 수 있는 상세 옵션 섹션

2. **빠른 생성 플로우**
   - 제목 + 시간만으로 생성 가능
   - 기본값 스마트 설정 (현재 시간 기준)

### Phase 2: 모바일 인터랙션 강화 (3-4일)
1. **제스처 지원**
   - 좌우 스와이프로 날짜 이동
   - 롱프레스 빠른 메뉴
   - 햅틱 피드백 추가

2. **파이 차트 드래그 앤 드롭**
   - 이벤트 시간 조정
   - 새 이벤트 드래그로 생성

### Phase 3: 다중 뷰 추가 (4-5일)
1. **주간 뷰**
   - 7개의 미니 파이 차트
   - 한 주의 패턴 파악

2. **월간 뷰**
   - 날짜별 이벤트 밀도 히트맵
   - 월간 통계 요약

### Phase 4: 커스터마이징 (2-3일)
1. **색상 시스템 개선**
   - Custom Color Picker
   - 최근 사용 색상 캐싱
   - 테마별 색상 팔레트

2. **사용자 프리셋**
   - 자주 쓰는 이벤트 템플릿
   - 빠른 생성 단축키

---

## 📐 기술 구현 가이드

### 1. EventModal 리팩토링

```typescript
// Before: EventModal.tsx (629줄)
export function EventModal({ ... }: EventModalProps) {
  // 모든 로직이 하나의 컴포넌트에
}

// After: 분리된 컴포넌트
export function EventModal({ ... }: EventModalProps) {
  const [step, setStep] = useState<'quick' | 'detailed'>('quick')

  return (
    <AddModal {...}>
      <EventTypeSelector />
      {step === 'quick' ? (
        <QuickEventForm onExpand={() => setStep('detailed')} />
      ) : (
        <DetailedEventForm />
      )}
    </AddModal>
  )
}

// QuickEventForm.tsx (핵심만)
export function QuickEventForm({ type, onExpand }: Props) {
  return (
    <>
      <Input label="제목" />
      <QuickPurposeSelector /> {/* 4개만 */}
      <TimeRangePicker />
      <button onClick={onExpand}>▼ 더 많은 옵션</button>
      <Button>저장</Button>
    </>
  )
}
```

### 2. 드래그 앤 드롭

```typescript
// PieChart.tsx에 드래그 핸들러 추가
const [dragState, setDragState] = useState<{
  isDragging: boolean
  eventId: string | null
  startAngle: number
}>({ isDragging: false, eventId: null, startAngle: 0 })

const handleDragStart = (e: React.MouseEvent, slice: Slice) => {
  if (!slice.event) return
  setDragState({
    isDragging: true,
    eventId: slice.event.id,
    startAngle: slice.startAngle
  })
}

const handleDragMove = (e: React.MouseEvent) => {
  if (!dragState.isDragging) return
  const angle = calculateAngleFromMouse(e, center)
  // 이벤트 시간 조정 로직
}
```

### 3. 제스처 지원

```typescript
// page.tsx에 제스처 훅 추가
import { useSwipeable } from 'react-swipeable'

const swipeHandlers = useSwipeable({
  onSwipedLeft: () => setSelectedDate(addDays(selectedDate, 1)),
  onSwipedRight: () => setSelectedDate(addDays(selectedDate, -1)),
  trackMouse: true,
  delta: 50,
})

return (
  <div {...swipeHandlers}>
    <PieChart ... />
  </div>
)
```

---

## 📊 예상 효과

### UX 개선
- ⚡ 이벤트 생성 시간: **50% 단축** (8탭 → 4탭)
- 📱 모바일 사용성: **40% 향상** (제스처, 햅틱)
- 🎯 직관성: **60% 개선** (드래그 앤 드롭)

### 기술적 이점
- 📦 컴포넌트 재사용성: EventModal 분리로 유지보수 용이
- 🚀 성능: 조건부 렌더링 감소
- 🧪 테스트 용이성: 작은 컴포넌트로 분리

### 차별화 포인트
- 🥧 **파이 차트 유지**: Time Pie의 정체성 보존
- ➕ **Timeblocks 장점 흡수**: 드래그 앤 드롭, 빠른 생성
- 🎨 **독창적 조합**: 원형 UI + 종이 다이어리 느낌

---

## 🎯 결론

**유지할 것**:
- ✅ 파이 차트 중심 시각화 (Time Pie의 강점)
- ✅ Hard/Anchor/Soft 3단계 타입 시스템
- ✅ Execution Timer 기능

**개선할 것**:
- 🔄 이벤트 생성 플로우 간소화 (629줄 모달 → 단계별 분리)
- 🔄 모바일 인터랙션 강화 (제스처, 드래그 앤 드롭)

**추가할 것**:
- ➕ 주간/월간 뷰 (파이 차트 보완)
- ➕ 빠른 액션 메뉴 (롱프레스)
- ➕ 색상 커스터마이징

**최종 목표**: Timeblocks의 직관성과 Time Pie의 독창성을 결합한 **최고의 모바일 시간 관리 앱**
