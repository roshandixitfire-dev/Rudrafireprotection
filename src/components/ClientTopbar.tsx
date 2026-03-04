'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface ClientTopbarProps {
    email: string
    company?: string | null
}

export default function ClientTopbar({ email, company }: ClientTopbarProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        // Clear demo cookie
        await fetch('/api/demo-logout', { method: 'POST' })
        // Also sign out of Supabase in case of real auth
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="topbar portal-topbar">
            <div className="topbar-left">
                <h1 className="topbar-title">Client Portal</h1>
                {company && <span className="topbar-company">{company}</span>}
            </div>
            <div className="topbar-right">
                <div className="user-info">
                    <div className="user-avatar portal-avatar">{email[0].toUpperCase()}</div>
                    <span className="user-email">{email}</span>
                </div>
                <button onClick={handleSignOut} className="sign-out-btn">
                    Sign Out
                </button>
            </div>
        </header>
    )
}
