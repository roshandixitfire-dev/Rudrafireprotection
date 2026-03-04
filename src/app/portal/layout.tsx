import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/supabase/auth'
import ClientSidebar from '@/components/ClientSidebar'
import ClientTopbar from '@/components/ClientTopbar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const userWithRole = await getUserWithRole()

    if (!userWithRole) {
        redirect('/login')
    }

    if (userWithRole.role !== 'client') {
        redirect('/dashboard')
    }

    return (
        <div className="dashboard-shell portal-shell">
            <ClientSidebar />
            <div className="dashboard-main">
                <ClientTopbar
                    email={userWithRole.user.email}
                    company={userWithRole.company}
                />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    )
}
