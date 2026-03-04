import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { DEMO_SERVICES, DEMO_ACTIVITIES, DEMO_CLIENTS } from '@/utils/demo-data'
import ServicesClientWrapper from '@/components/services/ServicesClientWrapper'
import { createClient } from '@/utils/supabase/server'

const activitiesColumns = [
    { key: 'activity_date', label: 'Date' },
    { key: 'activity_time', label: 'Time' },
    { key: 'client_name', label: 'Client' },
    { key: 'activity_type', label: 'Activity' },
    { key: 'remarks', label: 'Remarks' },
]

export default async function ServicesPage() {
    const user = await getUserWithRole()
    let accessLevel: AccessLevel = 'view'

    if (user?.role === 'admin') {
        accessLevel = 'full'
    } else {
        const perm = user?.permissions?.find(p => p.module === 'services')
        if (perm) accessLevel = perm.access
    }

    const supabase = await createClient()
    const { data: services, error } = await supabase
        .from('services')
        .select('*, clients(*)')
        .order('service_date', { ascending: false })

    if (error) {
        console.warn('Note: Services table not ready or empty. Using fallback demo data.')
    }

    // Map DB fields to columns
    const formattedServices = services?.map(s => ({
        ...s,
        client: s.clients?.name || 'Unknown',
        date: s.service_date,
        type: s.service_type || s.type || 'Standard Service',
        technician: s.technician_name,
        serviceId: s.service_id,
        status: s.status || 'Scheduled'
    }))

    // Fetch Activities
    const { data: activities, error: activitiesErr } = await supabase
        .from('client_activities')
        .select('*, clients(name)')
        .order('activity_date', { ascending: false })
        .order('activity_time', { ascending: false })

    const rawActivities = (activities && activities.length > 0) ? activities : DEMO_ACTIVITIES
    const formattedActivities = rawActivities.map(a => ({
        ...a,
        client_name: a.clients?.name || a.client_name || 'Unknown Client'
    }))

    // Fetch Reminders
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

    // Fetch clients
    const { data: clientsList } = await supabase.from('clients').select('id, name, service_plan').order('name')
    const finalClientsList = (clientsList && clientsList.length > 0) ? clientsList : DEMO_CLIENTS.map(c => ({
        id: c.id,
        name: c.name,
        service_plan: c.service_plan
    }))

    // Fetch Audit Reports
    const { data: auditReports } = await supabase
        .from('audit_reports')
        .select('*, clients(name)')
        .order('report_date', { ascending: false })

    const formattedReports = (auditReports || []).map(r => ({
        ...r,
        client_name: r.clients?.name || 'Unknown Client'
    }))

    const displayData = (formattedServices && formattedServices.length > 0) ? formattedServices : DEMO_SERVICES

    return (
        <ServicesClientWrapper
            servicesData={displayData as any}
            activitiesData={formattedActivities}
            remindersData={formattedReminders}
            auditReportsData={formattedReports}
            clients={finalClientsList}
            accessLevel={accessLevel}
            activitiesColumns={activitiesColumns}
        />
    )
}
