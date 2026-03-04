import { getUserWithRole } from '@/utils/supabase/auth'
import OdooDashboard from '@/components/dashboard/OdooDashboard'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardHome() {
    const userWithRole = await getUserWithRole()
    const supabase = await createClient()

    // Fetch activities
    const { data: activities } = await supabase
        .from('client_activities')
        .select('*, clients(name)')
        .order('activity_date', { ascending: false })
        .limit(50)

    // Fetch audits
    const { data: audits } = await supabase
        .from('audit_reports')
        .select('*, clients(name)')
        .order('report_date', { ascending: false })
        .limit(20)

    const formattedActivities = (activities || []).map(a => ({
        ...a,
        client_name: a.clients?.name || a.client_name || 'Unknown Client'
    }))

    const formattedAudits = (audits || []).map(a => ({
        ...a,
        client_name: a.clients?.name || 'Unknown Client'
    }))

    return <OdooDashboard activities={formattedActivities} audits={formattedAudits} />
}
