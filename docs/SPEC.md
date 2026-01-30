# Time Pie - 기술 스펙 및 개발 지침서

## 1. 기술 스택 개요

### 1.1 스택 요약

| 영역 | 기술 | 버전 |
|------|------|------|
| **프론트엔드** | Next.js (App Router) | 16.x |
| **언어** | TypeScript | 5.9.x |
| **스타일링** | Tailwind CSS | 4.x |
| **상태관리** | Zustand | 5.x |
| **백엔드/DB** | Supabase (PostgreSQL) | - |
| **인증** | Supabase Auth | - |
| **모바일** | React Native + Expo | 54.x |
| **차트** | D3.js 또는 Recharts | - |
| **배포** | Vercel (웹) | - |

### 1.2 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                            │
├─────────────────────────┬───────────────────────────────────┤
│      Next.js (웹)       │       React Native (모바일)        │
│    - App Router         │       - Expo                      │
│    - RSC + Client       │       - 공유 로직 (packages/)     │
└───────────┬─────────────┴──────────────┬────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Auth     │  │ Database │  │ Realtime │  │ Edge Funcs  │  │
│  │          │  │ (PG)     │  │          │  │             │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 프로젝트 구조

### 2.1 모노레포 구조 (Turborepo)

```
time-pie/
├── apps/
│   ├── web/                    # Next.js 웹 앱
│   │   ├── app/                # App Router
│   │   │   ├── (auth)/         # 인증 관련 라우트
│   │   │   ├── (main)/         # 메인 앱 라우트
│   │   │   │   ├── pie/        # 파이 차트 뷰
│   │   │   │   ├── calendar/   # 캘린더 뷰
│   │   │   │   ├── todos/      # 투두 리스트
│   │   │   │   └── habits/     # 습관 트래커
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/         # 웹 전용 컴포넌트
│   │   └── lib/                # 웹 전용 유틸
│   │
│   └── mobile/                 # React Native (Expo)
│       ├── app/                # Expo Router
│       ├── components/         # 모바일 전용 컴포넌트
│       └── lib/                # 모바일 전용 유틸
│
├── packages/
│   ├── ui/                     # 공유 UI 컴포넌트
│   │   ├── pie-chart/          # 파이 차트 컴포넌트
│   │   ├── button/
│   │   ├── input/
│   │   └── ...
│   ├── core/                   # 공유 비즈니스 로직
│   │   ├── hooks/              # 공유 훅
│   │   ├── stores/             # Zustand 스토어
│   │   ├── types/              # TypeScript 타입
│   │   └── utils/              # 유틸리티 함수
│   ├── supabase/               # Supabase 클라이언트 & 타입
│   │   ├── client.ts
│   │   ├── types.ts            # 자동 생성된 DB 타입
│   │   └── queries/            # 쿼리 함수
│   └── config/                 # 공유 설정
│       ├── eslint/
│       └── tsconfig/
│
├── supabase/
│   ├── migrations/             # DB 마이그레이션
│   ├── seed.sql                # 시드 데이터
│   └── functions/              # Edge Functions
│
├── docs/                       # 문서
│   ├── PRD.md
│   ├── SPEC.md
│   └── API.md
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 2.2 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | PascalCase | `PieChart.tsx` |
| 파일 (유틸) | camelCase | `formatDate.ts` |
| 폴더 | kebab-case | `pie-chart/` |
| 컴포넌트 | PascalCase | `export function PieChart()` |
| 훅 | camelCase + use prefix | `useEvents()` |
| 타입/인터페이스 | PascalCase | `type Event = {}` |
| 상수 | UPPER_SNAKE_CASE | `const MAX_EVENTS = 100` |
| DB 테이블 | snake_case | `habit_logs` |
| DB 컬럼 | snake_case | `created_at` |

---

## 3. 데이터베이스 스키마

### 3.1 ERD

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │     events      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK)    │──┐
│ name            │  │    │ title           │  │
│ avatar_url      │  │    │ description     │  │
│ settings (JSON) │  │    │ start_at        │  │
│ created_at      │  │    │ end_at          │  │
│ updated_at      │  │    │ is_all_day      │  │
└─────────────────┘  │    │ color           │  │
                     │    │ category_id(FK) │  │
                     │    │ reminder_min    │  │
┌─────────────────┐  │    │ created_at      │  │
│   categories    │  │    │ updated_at      │  │
├─────────────────┤  │    └─────────────────┘  │
│ id (PK)         │──┼───────────────────────-─┤
│ user_id (FK)    │──┤                         │
│ name            │  │    ┌─────────────────┐  │
│ color           │  │    │     todos       │  │
│ created_at      │  │    ├─────────────────┤  │
└─────────────────┘  │    │ id (PK)         │  │
                     ├────│ user_id (FK)    │──┤
                     │    │ title           │  │
┌─────────────────┐  │    │ description     │  │
│     habits      │  │    │ due_date        │  │
├─────────────────┤  │    │ priority        │  │
│ id (PK)         │  │    │ is_completed    │  │
│ user_id (FK)    │──┤    │ completed_at    │  │
│ title           │  │    │ category_id(FK) │  │
│ description     │  │    │ created_at      │  │
│ frequency       │  │    │ updated_at      │  │
│ target_count    │  │    └─────────────────┘  │
│ color           │  │                         │
│ reminder_time   │  │    ┌─────────────────┐  │
│ is_active       │  │    │   habit_logs    │  │
│ created_at      │  │    ├─────────────────┤  │
│ updated_at      │  │    │ id (PK)         │  │
└────────┬────────┘  │    │ habit_id (FK)   │──┘
         │           │    │ date            │
         └───────────┼───▶│ completed_count │
                     │    │ created_at      │
                     │    └─────────────────┘
                     │
```

### 3.2 SQL 스키마

```sql
-- 사용자 (Supabase Auth 연동)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 카테고리
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  color text not null default '#FF6B35',
  created_at timestamptz default now()
);

-- 일정 (이벤트)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_all_day boolean default false,
  color text not null default '#FF6B35',
  category_id uuid references public.categories on delete set null,
  reminder_min integer, -- 시작 전 알림 (분)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 투두
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  is_completed boolean default false,
  completed_at timestamptz,
  category_id uuid references public.categories on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 습관
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  description text,
  frequency text check (frequency in ('daily', 'weekly', 'custom')) default 'daily',
  frequency_config jsonb default '{}', -- custom frequency 설정
  target_count integer default 1,
  color text not null default '#2ECC71',
  reminder_time time,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 습관 기록
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits on delete cascade not null,
  date date not null,
  completed_count integer default 0,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

-- RLS (Row Level Security) 정책
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.todos enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- 사용자는 자신의 데이터만 접근 가능
create policy "Users can view own data" on public.users
  for all using (auth.uid() = id);

create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

create policy "Users can manage own events" on public.events
  for all using (auth.uid() = user_id);

create policy "Users can manage own todos" on public.todos
  for all using (auth.uid() = user_id);

create policy "Users can manage own habits" on public.habits
  for all using (auth.uid() = user_id);

create policy "Users can manage own habit_logs" on public.habit_logs
  for all using (
    auth.uid() = (select user_id from public.habits where id = habit_id)
  );

-- 인덱스
create index events_user_id_idx on public.events(user_id);
create index events_start_at_idx on public.events(start_at);
create index todos_user_id_idx on public.todos(user_id);
create index todos_due_date_idx on public.todos(due_date);
create index habits_user_id_idx on public.habits(user_id);
create index habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index habit_logs_date_idx on public.habit_logs(date);
```

---

## 4. API 설계

### 4.1 Supabase 클라이언트 쿼리

Supabase JS SDK를 사용하여 직접 쿼리합니다. REST API나 GraphQL 대신 타입 안전한 SDK 사용을 권장합니다.

```typescript
// packages/supabase/queries/events.ts
import { supabase } from '../client'
import type { Event, EventInsert, EventUpdate } from '../types'

export async function getEventsByDate(userId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', startOfDay.toISOString())
    .lte('start_at', endOfDay.toISOString())
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function createEvent(event: EventInsert) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, updates: EventUpdate) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

### 4.2 API 엔드포인트 (Edge Functions)

복잡한 로직이 필요한 경우 Supabase Edge Functions 사용:

| 함수 | 설명 | 트리거 |
|------|------|--------|
| `send-reminder` | 알림 전송 | Cron (매분) |
| `calculate-streak` | 스트릭 계산 | DB trigger |
| `sync-calendar` | 외부 캘린더 동기화 | HTTP |

---

## 5. 컴포넌트 설계

### 5.1 파이 차트 컴포넌트 (핵심)

```typescript
// packages/ui/pie-chart/PieChart.tsx

interface PieChartProps {
  events: Event[]
  currentTime?: Date
  onEventClick?: (event: Event) => void
  onTimeSlotClick?: (startHour: number) => void
  onEventDrag?: (event: Event, newStart: Date, newEnd: Date) => void
  size?: number
  showLabels?: boolean
}

interface TimeSlice {
  startAngle: number  // 0-360
  endAngle: number
  event?: Event
  color: string
  isEmpty: boolean
}

/**
 * 24시간 파이 차트 컴포넌트
 *
 * - 24시간 = 360도
 * - 1시간 = 15도
 * - 12시(정오)가 하단, 0시(자정)가 상단
 * - 시계 방향으로 시간 진행
 */
export function PieChart({
  events,
  currentTime = new Date(),
  onEventClick,
  onTimeSlotClick,
  onEventDrag,
  size = 300,
  showLabels = true,
}: PieChartProps) {
  // 구현
}
```

### 5.2 시간-각도 변환 유틸리티

```typescript
// packages/core/utils/pieUtils.ts

/**
 * 시간을 각도로 변환
 * 0시(자정) = 0도 (상단)
 * 6시 = 90도 (우측)
 * 12시(정오) = 180도 (하단)
 * 18시 = 270도 (좌측)
 */
export function timeToAngle(date: Date): number {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const totalMinutes = hours * 60 + minutes
  return (totalMinutes / (24 * 60)) * 360
}

/**
 * 각도를 시간으로 변환
 */
export function angleToTime(angle: number, baseDate: Date): Date {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const totalMinutes = (normalizedAngle / 360) * 24 * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  const result = new Date(baseDate)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * 이벤트를 파이 조각으로 변환
 */
export function eventToSlice(event: Event): TimeSlice {
  return {
    startAngle: timeToAngle(new Date(event.start_at)),
    endAngle: timeToAngle(new Date(event.end_at)),
    event,
    color: event.color,
    isEmpty: false,
  }
}
```

### 5.3 공유 컴포넌트 목록

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `PieChart` | `packages/ui/pie-chart` | 24시간 파이 차트 |
| `EventCard` | `packages/ui/event` | 이벤트 카드 |
| `TodoItem` | `packages/ui/todo` | 투두 아이템 |
| `HabitItem` | `packages/ui/habit` | 습관 아이템 + 체크 |
| `StreakBadge` | `packages/ui/habit` | 스트릭 배지 |
| `Button` | `packages/ui/button` | 공통 버튼 |
| `Input` | `packages/ui/input` | 공통 입력 |
| `Modal` | `packages/ui/modal` | 모달/바텀시트 |
| `DatePicker` | `packages/ui/date-picker` | 날짜 선택기 |
| `TimePicker` | `packages/ui/time-picker` | 시간 선택기 |
| `ColorPicker` | `packages/ui/color-picker` | 색상 선택기 |

---

## 6. 상태 관리

### 6.1 Zustand 스토어 구조

```typescript
// packages/core/stores/eventStore.ts
import { create } from 'zustand'
import { Event } from '@time-pie/supabase'

interface EventState {
  events: Event[]
  selectedDate: Date
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedDate: (date: Date) => void
  fetchEvents: (date: Date) => Promise<void>
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchEvents: async (date) => {
    set({ isLoading: true, error: null })
    try {
      const events = await getEventsByDate(date)
      set({ events, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // ... 나머지 액션
}))
```

### 6.2 스토어 목록

| 스토어 | 용도 |
|--------|------|
| `useAuthStore` | 인증 상태, 사용자 정보 |
| `useEventStore` | 일정 CRUD, 선택된 날짜 |
| `useTodoStore` | 투두 CRUD, 필터 |
| `useHabitStore` | 습관 CRUD, 로그, 스트릭 |
| `useUIStore` | 모달, 사이드바, 테마 |

---

## 7. 개발 워크플로우

### 7.1 스펙 주도 개발 프로세스

```
┌─────────────────────────────────────────────────────────────┐
│  1. 스펙 정의                                                │
│     - PRD에서 기능 요구사항 확인                              │
│     - 이 문서에서 기술 스펙 확인                              │
│     - 필요시 스펙 문서 업데이트                               │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 타입 정의                                                │
│     - DB 스키마 → Supabase 타입 자동 생성                    │
│     - 컴포넌트 Props 인터페이스 정의                          │
│     - API 요청/응답 타입 정의                                 │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 테스트 작성 (TDD 권장)                                   │
│     - 유닛 테스트: 유틸 함수, 훅                              │
│     - 컴포넌트 테스트: 핵심 UI                                │
│     - E2E 테스트: 주요 사용자 플로우                          │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 구현                                                     │
│     - 타입과 테스트를 가이드로 구현                           │
│     - 스펙 문서 참조하며 개발                                 │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 리뷰 & 문서 업데이트                                     │
│     - PR 리뷰                                                │
│     - 스펙 변경사항 문서 반영                                 │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 브랜치 전략

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/pie-chart-view
        ├── feature/todo-crud
        ├── feature/habit-streak
        └── fix/event-overlap
```

| 브랜치 | 용도 | 배포 환경 |
|--------|------|----------|
| `main` | 프로덕션 릴리즈 | Production |
| `develop` | 개발 통합 | Staging |
| `feature/*` | 새 기능 개발 | Preview |
| `fix/*` | 버그 수정 | Preview |

### 7.3 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**예시:**
```
feat(pie-chart): implement 24-hour circular time view

- Add PieChart component with SVG rendering
- Add time-to-angle conversion utilities
- Add drag-to-reschedule functionality

Closes #12
```

---

## 8. 테스트 전략

### 8.1 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 유닛 테스트 |
| React Testing Library | 컴포넌트 테스트 |
| Playwright | E2E 테스트 |
| MSW | API 모킹 |

### 8.2 테스트 커버리지 목표

| 영역 | 최소 커버리지 |
|------|--------------|
| 유틸 함수 | 90% |
| 핵심 컴포넌트 (PieChart) | 80% |
| 스토어 | 80% |
| 일반 컴포넌트 | 60% |

### 8.3 테스트 예시

```typescript
// packages/core/utils/__tests__/pieUtils.test.ts
import { describe, it, expect } from 'vitest'
import { timeToAngle, angleToTime } from '../pieUtils'

describe('timeToAngle', () => {
  it('converts midnight (00:00) to 0 degrees', () => {
    const date = new Date('2024-01-15T00:00:00')
    expect(timeToAngle(date)).toBe(0)
  })

  it('converts 6:00 AM to 90 degrees', () => {
    const date = new Date('2024-01-15T06:00:00')
    expect(timeToAngle(date)).toBe(90)
  })

  it('converts noon (12:00) to 180 degrees', () => {
    const date = new Date('2024-01-15T12:00:00')
    expect(timeToAngle(date)).toBe(180)
  })

  it('converts 6:00 PM to 270 degrees', () => {
    const date = new Date('2024-01-15T18:00:00')
    expect(timeToAngle(date)).toBe(270)
  })
})

describe('angleToTime', () => {
  it('converts 0 degrees to midnight', () => {
    const baseDate = new Date('2024-01-15')
    const result = angleToTime(0, baseDate)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
  })
})
```

---

## 9. 성능 가이드라인

### 9.1 목표 지표

| 지표 | 목표 |
|------|------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |

### 9.2 최적화 전략

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - WebP 포맷 사용

2. **번들 최적화**
   - 동적 import로 코드 스플리팅
   - Tree shaking 확인

3. **데이터 페칭**
   - React Query 또는 SWR 사용
   - 적절한 캐싱 전략

4. **렌더링 최적화**
   - React.memo 적절히 사용
   - useMemo, useCallback 필요한 곳에만

---

## 10. 보안 가이드라인

### 10.1 인증/인가

- Supabase Auth 사용 (OAuth, Magic Link)
- JWT 토큰 자동 갱신
- RLS(Row Level Security)로 데이터 보호

### 10.2 데이터 보호

- 모든 API 통신 HTTPS
- 민감 정보 클라이언트에 노출 금지
- 환경 변수로 시크릿 관리

### 10.3 환경 변수

```env
# .env.local (예시)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 서버에서만 사용
```

---

## 11. 배포 설정

### 11.1 Vercel 설정

```json
// vercel.json
{
  "buildCommand": "pnpm turbo run build --filter=web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

### 11.2 환경별 설정

| 환경 | 도메인 | DB |
|------|--------|-----|
| Production | timepie.app | Supabase Production |
| Staging | staging.timepie.app | Supabase Staging |
| Preview | *.vercel.app | Supabase Development |

---

## 12. 체크리스트

### 12.1 개발 시작 전 체크리스트

- [ ] Node.js 20.x 설치
- [ ] pnpm 설치 (`npm install -g pnpm`)
- [ ] 프로젝트 클론 및 의존성 설치 (`pnpm install`)
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] Supabase 로컬 설정 또는 개발 프로젝트 연결
- [ ] PRD.md, SPEC.md 숙지

### 12.2 PR 체크리스트

- [ ] 타입 에러 없음 (`pnpm typecheck`)
- [ ] 린트 통과 (`pnpm lint`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] 빌드 성공 (`pnpm build`)
- [ ] 스펙 문서 업데이트 (필요시)
- [ ] 스크린샷/GIF 첨부 (UI 변경시)

---

*문서 버전: 1.1*
*최종 수정: 2026년 1월*
*작성자: Time Pie 팀*
