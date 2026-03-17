-- 알림 시스템 전면 개편: 일정 복수 알람, 습관/할일 알림, 타임존 지원

-- 1. user_settings에 timezone 추가
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Seoul';

-- 2. events: reminder_min → reminder_mins (INT ARRAY)
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_mins int4[] DEFAULT NULL;
UPDATE events SET reminder_mins = ARRAY[reminder_min] WHERE reminder_min IS NOT NULL AND reminder_mins IS NULL;
ALTER TABLE events DROP COLUMN IF EXISTS reminder_min;

-- 3. todos: reminder_at 추가
ALTER TABLE todos ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ DEFAULT NULL;

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS idx_events_reminder_mins ON events USING GIN (reminder_mins) WHERE reminder_mins IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_todos_reminder_at ON todos (reminder_at) WHERE reminder_at IS NOT NULL AND is_completed = false;
CREATE INDEX IF NOT EXISTS idx_habits_reminder_time ON habits (reminder_time) WHERE reminder_time IS NOT NULL AND is_active = true;
