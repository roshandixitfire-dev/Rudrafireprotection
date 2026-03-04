import { NextResponse } from 'next/server'
import { DEMO_COOKIE_NAME } from '@/utils/supabase/demo-users'

export async function POST() {
    const response = NextResponse.json({ success: true })

    response.cookies.set(DEMO_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
    })

    return response
}
