-- Weekly Reports 테이블 생성 + pg_cron 스케줄 등록
--
-- 사전 조건:
--   1. pg_cron, pg_net 확장이 이미 활성화되어 있어야 함
--   2. YOUR_DOMAIN, YOUR_CRON_SECRET 을 실제 값으로 교체

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_events INTEGER NOT NULL DEFAULT 0,
  total_duration_min INTEGER NOT NULL DEFAULT 0,
  purpose_distribution JSONB NOT NULL DEFAULT '{}',
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  daily_completion JSONB NOT NULL DEFAULT '[]',
  prev_week_comparison JSONB,
  habit_summary JSONB NOT NULL DEFAULT '{}',
  todo_summary JSONB NOT NULL DEFAULT '{}',
  ai_insights JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- 2. RLS 활성화
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own weekly reports" ON weekly_reports;
CREATE POLICY "Users can view own weekly reports" ON weekly_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access (cron job이 데이터를 upsert하기 위해 필요)
DROP POLICY IF EXISTS "Service role full access on weekly reports" ON weekly_reports;
CREATE POLICY "Service role full access on weekly reports" ON weekly_reports
  FOR ALL USING (auth.role() = 'service_role');

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_week
  ON weekly_reports(user_id, week_start DESC);

-- 4. pg_cron 스케줄: 매주 월요일 00:00 UTC (09:00 KST)
select cron.schedule(
  'weekly-report-every-monday',
  '0 0 * * 1',
  $$
  select net.http_get(
    url := 'https://YOUR_DOMAIN/api/cron/weekly-report',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
