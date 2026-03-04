'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardTopbarProps {
    email: string
    role: 'admin' | 'employee' | 'client'
}

export default function DashboardTopbar({ email, role }: DashboardTopbarProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        await fetch('/api/demo-logout', { method: 'POST' })
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="topbar">
            <div className="topbar-left">
                {/* Removed Dashboard Title and Role Badge per user request to save vertical space */}
            </div>
            <div className="topbar-right">
                <div className="user-info">
                    <div className="user-avatar">{email[0].toUpperCase()}</div>
                    <span className="user-email">{email}</span>
                </div>
                <button onClick={handleSignOut} className="sign-out-btn">
                    Sign Out
                </button>
            </div>
        </header>
    )
}
