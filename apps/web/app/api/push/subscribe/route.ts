import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Route Handler에서 호출 시 무시
          }
        },
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error('Push auth failed:', error?.message || 'No user')
    return null
  }
  return user
}

/** POST: 푸시 구독 저장 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription } = await request.json()

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin().from('push_subscriptions').upsert(
      {
        user_id: user.id,
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
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
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
