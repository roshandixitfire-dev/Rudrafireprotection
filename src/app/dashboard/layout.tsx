import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/supabase/auth'
import DashboardSidebar from '@/components/DashboardSidebar'
import { SidebarProvider } from '@/components/SidebarProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const userWithRole = await getUserWithRole()

    if (!userWithRole) {
        redirect('/login')
    }

    if (userWithRole.role === 'client') {
        redirect('/portal')
    }

    return (
        <SidebarProvider>
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
        </SidebarProvider>
    )
}
