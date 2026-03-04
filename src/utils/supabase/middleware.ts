import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_COOKIE_NAME, DEMO_USERS } from './demo-users'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const pathname = request.nextUrl.pathname
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/portal')
    const isLoginPage = pathname === '/login'

    // Check demo cookie first
    const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)
    if (demoCookie) {
        try {
            const demoUser = JSON.parse(demoCookie.value)
            if (demoUser && demoUser.email && DEMO_USERS[demoUser.email]) {
                const role = DEMO_USERS[demoUser.email].role

                // Demo user on login page → redirect to correct dashboard
                if (isLoginPage) {
                    return NextResponse.redirect(new URL(role === 'client' ? '/portal' : '/dashboard', request.url))
                }

                // Client trying to access employee/admin dashboard
                if (role === 'client' && pathname.startsWith('/dashboard')) {
                    return NextResponse.redirect(new URL('/portal', request.url))
                }

                // Admin or Employee trying to access client portal
                if ((role === 'admin' || role === 'employee') && pathname.startsWith('/portal')) {
                    return NextResponse.redirect(new URL('/dashboard', request.url))
                }

                return response
            }
        } catch {
            // Invalid cookie, proceed to Supabase check
        }
    }

    // Supabase auth check
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isProtectedRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'client'

        if (role === 'client' && pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/portal', request.url))
        }

        if ((role === 'admin' || role === 'employee') && pathname.startsWith('/portal')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (user && isLoginPage) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'client'
        return NextResponse.redirect(new URL(role === 'client' ? '/portal' : '/dashboard', request.url))
    }

    return response
}
