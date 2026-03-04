import { NextResponse } from 'next/server'
import { DEMO_COOKIE_NAME, validateDemoLogin, isDemoEmail } from '@/utils/supabase/demo-users'

export async function POST(request: Request) {
    const { email, password } = await request.json()

    if (!isDemoEmail(email)) {
        return NextResponse.json({ error: 'Not a demo account' }, { status: 400 })
    }

    const demoUser = validateDemoLogin(email, password)
    if (!demoUser) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({
        success: true,
        role: demoUser.role,
        redirect: demoUser.role === 'client' ? '/portal' : '/dashboard',
    })

    response.cookies.set(DEMO_COOKIE_NAME, JSON.stringify(demoUser), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
}
