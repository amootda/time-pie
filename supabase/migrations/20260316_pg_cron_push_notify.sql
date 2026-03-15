-- pg_cron + pg_net: 매분 /api/cron/notify 호출
--
-- 사전 조건:
--   1. Supabase Dashboard → Database → Extensions 에서 pg_cron, pg_net 활성화
--   2. 아래 SQL에서 YOUR_DOMAIN, YOUR_CRON_SECRET 을 실제 값으로 교체
--
-- 예시:
--   YOUR_DOMAIN → time-pie.vercel.app
--   YOUR_CRON_SECRET → my-secret-key-123

select cron.schedule(
  'push-notify-every-minute',
  '* * * * *',
  $$
  select net.http_get(
    url := 'https://YOUR_DOMAIN/api/cron/notify',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
