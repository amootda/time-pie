import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** POST: 푸시 구독 저장 */
export async function POST(request: Request) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription?.endpoint || !subscription?.keys || !userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin().from('push_subscriptions').upsert(
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
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE: 푸시 구독 해제 */
export async function DELETE(request: Request) {
  try {
    const { endpoint, userId } = await request.json()

    if (!endpoint || !userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Failed to delete push subscription:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
