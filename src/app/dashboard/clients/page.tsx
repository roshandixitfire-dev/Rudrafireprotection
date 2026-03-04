import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel, DEMO_USERS } from '@/utils/supabase/demo-users'
import { DEMO_CLIENTS } from '@/utils/demo-data'
import ClientsClientView from './ClientsClientView'

export default async function ClientsPage() {
    const userData = await getUserWithRole()

    // Determine access level
    let accessLevel: AccessLevel = 'view'
    if (userData?.role === 'admin') accessLevel = 'full'
    else if (userData?.role === 'employee') accessLevel = 'edit'

    if (userData?.user.email && DEMO_USERS[userData.user.email]) {
        const perm = DEMO_USERS[userData.user.email].permissions.find((p: any) => p.module === 'clients')
        if (perm) accessLevel = perm.access
    }

    // Fetch data from Supabase
    let clientsData: any[] = DEMO_CLIENTS

    try {
        const supabase = await createClient()

        // Timeout logic for Supabase request
        const fetchPromise = supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })

        let timeoutId: ReturnType<typeof setTimeout>
        const timeoutPromise = new Promise((_, reject) =>
            timeoutId = setTimeout(() => reject(new Error('Connection timed out')), 5000)
        )

        const result: any = await Promise.race([fetchPromise, timeoutPromise]).finally(() => clearTimeout(timeoutId))

        if (result.error) throw result.error
        if (result.data && result.data.length > 0) {
            clientsData = result.data
        }
    } catch (e: any) {
        console.warn('Clients Fetch Failed:', e.message)
        console.warn('Network issue detected. Using fallback demo data for Clients.')
    }

    return (
        <ClientsClientView
            title={userData?.role === 'admin' ? "All Clients Master" : "My Clients"}
            data={clientsData}
            accessLevel={accessLevel}
        />
    )
}
