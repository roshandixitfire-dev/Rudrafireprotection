import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const userWithRole = await getUserWithRole()

    if (!userWithRole) {
        redirect('/login')
    }

    if (userWithRole.role === 'client') {
        redirect('/portal')
    }

    return (
        <div className="dashboard-shell">
            <DashboardSidebar
                role={userWithRole.role}
                permissions={userWithRole.permissions}
                email={userWithRole.user.email}
            />
            <div className="dashboard-main">
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    )
}
