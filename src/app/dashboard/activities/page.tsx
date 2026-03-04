
import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { DEMO_ACTIVITIES, DEMO_CLIENTS } from '@/utils/demo-data'
import ActivitiesClientView from './ActivitiesClientView'

const columns = [
    { key: 'activity_date', label: 'Date' },
    { key: 'activity_time', label: 'Time' },
    { key: 'client_name', label: 'Client' },
    { key: 'activity_type', label: 'Activity' },
    { key: 'remarks', label: 'Remarks' },
]

export default async function ActivitiesPage() {
    const user = await getUserWithRole()
    let accessLevel: AccessLevel = 'view'

    if (user?.role === 'admin') accessLevel = 'full'
    else if (user?.role === 'employee') accessLevel = 'edit'

    const supabase = await createClient()

    // Fetch activities with client names
    const { data: activities, error } = await supabase
        .from('client_activities')
        .select('*, clients(name)')
        .order('activity_date', { ascending: false })
        .order('activity_time', { ascending: false })

    if (error) {
        console.warn('Network issue detected. Using fallback demo data for Activities.')
    }

    // Process data or use demo
    const rawActivities = (activities && activities.length > 0) ? activities : DEMO_ACTIVITIES
    const formattedActivities = rawActivities.map(a => ({
        ...a,
        client_name: a.clients?.name || a.client_name || 'Unknown Client'
    }))

    // Fetch reminders
    const formattedReminders = formattedActivities.filter(a =>
        a.next_reminder_date &&
        a.reminder_status === 'Pending'
    ).map(a => ({
        ...a,
        client_name: a.client_name,
        next_reminder_date: a.next_reminder_date,
        reminder_type: a.reminder_type || 'Service',
        reminder_status: a.reminder_status
    })).sort((a, b) => new Date(a.next_reminder_date).getTime() - new Date(b.next_reminder_date).getTime())

    // Fetch clients for dropdown
    const { data: clientsList, error: clientError } = await supabase
        .from('clients')
        .select('id, name, service_plan')
        .order('name')

    if (clientError) {
        console.warn('Network issue detected. Using fallback demo data for Clients list.')
    }

    const finalClientsList = (clientsList && clientsList.length > 0) ? clientsList : DEMO_CLIENTS.map(c => ({
        id: c.id,
        name: c.name,
        service_plan: c.service_plan
    }))

    return (
        <ActivitiesClientView
            title="Recent Activities For clients"
            columns={columns}
            data={formattedActivities}
            upcomingReminders={formattedReminders}
            clients={finalClientsList}
            accessLevel={accessLevel}
        />
    )
}
