import { supabase } from '../client'

export interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

/** 푸시 구독 저장 (upsert) */
export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'user_id,endpoint' }
  )

  if (error) {
    console.error('Failed to save push subscription:', error)
    throw error
  }
}

/** 푸시 구독 삭제 */
export async function deletePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Failed to delete push subscription:', error)
    throw error
  }
}

/** 특정 유저의 모든 푸시 구독 조회 */
export async function getPushSubscriptionsByUserId(
  userId: string
): Promise<PushSubscriptionRow[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to get push subscriptions:', error)
    throw error
  }

  return data ?? []
}
