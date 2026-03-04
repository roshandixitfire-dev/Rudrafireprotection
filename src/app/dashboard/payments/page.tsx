import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { DEMO_PAYMENTS } from '@/utils/demo-data'
import ModuleClientWrapper from '@/components/ModuleClientWrapper'
import { createClient } from '@/utils/supabase/server'

const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'client', label: 'Client' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'date', label: 'Date' },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
]

export default async function PaymentsPage() {
    const user = await getUserWithRole()
    let accessLevel: AccessLevel = 'view'

    if (user?.role === 'admin') {
        accessLevel = 'full'
    } else {
        const perm = user?.permissions?.find(p => p.module === 'payments')
        if (perm) accessLevel = perm.access
    }

    const supabase = await createClient()
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*, clients(name)')
        .order('payment_date', { ascending: false })

    if (error) {
        console.warn('Note: Payments table not ready or empty. Using fallback demo data.')
    }

    // Map DB fields to columns
    const formattedPayments = payments?.map(p => ({
        ...p,
        client: p.clients?.name || 'Unknown',
        date: p.payment_date,
        method: p.payment_method,
        paymentId: p.payment_id
    }))

    const displayData = (formattedPayments && formattedPayments.length > 0) ? formattedPayments : DEMO_PAYMENTS

    return (
        <ModuleClientWrapper
            title={user?.role === 'admin' ? "All Payment Records" : "Payment Records"}
            columns={columns}
            data={displayData as any}
            accessLevel={accessLevel}
        />
    )
}
