import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'
import { DEMO_USERS, type DemoUser } from '@/utils/supabase/demo-users'
import UserManagementClientView from './UserManagementClientView'

export default async function UserManagementPage() {
    const userWithRole = await getUserWithRole()

    if (userWithRole?.role !== 'admin') {
        redirect('/dashboard')
    }

    const allUsers: DemoUser[] = Object.values(DEMO_USERS)

    return <UserManagementClientView users={allUsers} />
}
