import { cookies } from 'next/headers'
import { createClient } from './server'
import { DEMO_COOKIE_NAME, DEMO_USERS, type DemoUser, type UserPermission } from './demo-users'

export type UserRole = 'admin' | 'employee' | 'client'

export interface UserWithRole {
    user: {
        id: string
        email: string
    }
    role: UserRole
    fullName: string | null
    company: string | null
    isDemo: boolean
    permissions?: UserPermission[] // Array of granular permissions
}

/**
 * Fetch the current authenticated user and their role.
 * Checks demo cookie first, then falls back to Supabase auth.
 */
export async function getUserWithRole(): Promise<UserWithRole | null> {
    const cookieStore = await cookies()

    // Check demo cookie first
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    if (demoCookie) {
        try {
            const demoUser: DemoUser = JSON.parse(demoCookie.value)
            if (demoUser && demoUser.email && DEMO_USERS[demoUser.email]) {
                const fullUser = DEMO_USERS[demoUser.email]
                return {
                    user: { id: demoUser.id, email: demoUser.email },
                    role: fullUser.role,
                    fullName: fullUser.fullName,
                    company: fullUser.company,
                    isDemo: true,
                    permissions: fullUser.permissions,
                }
            }
        } catch {
            // Invalid cookie, fall through to Supabase
        }
    }

    // Fall back to Supabase auth with timeout
    try {
        const supabase = await createClient()

        const authPromise = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name, company')
                .eq('id', user.id)
                .single()

            return {
                user: { id: user.id, email: user.email || '' },
                role: (profile?.role as UserRole) || 'client',
                fullName: profile?.full_name || null,
                company: profile?.company || null,
                isDemo: false,
                permissions: [],
            }
        }

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )

        return await Promise.race([authPromise(), timeoutPromise]) as UserWithRole | null
    } catch (e) {
        console.error('getUserWithRole failed or timed out:', e)
        return null // Fallback to guest/login
    }
}
