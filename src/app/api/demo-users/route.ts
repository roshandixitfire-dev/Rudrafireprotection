import { NextResponse } from 'next/server'
import { DEMO_USERS, saveDemoUser, type DemoUser } from '@/utils/supabase/demo-users'

export async function GET() {
    return NextResponse.json(Object.values(DEMO_USERS))
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, fullName, company, role, permissions } = body

        if (!email || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const newUser: DemoUser = {
            id: DEMO_USERS[email]?.id || `demo-${role}-${Date.now()}`,
            email,
            role,
            fullName: fullName || 'New User',
            company: company || 'Rudra Fire Protection',
            permissions: permissions || []
        }

        saveDemoUser(newUser, password)

        return NextResponse.json({ success: true, user: newUser })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
    }
}
