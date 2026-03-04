import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { DEMO_INVOICES } from '@/utils/demo-data'
import ModuleClientWrapper from '@/components/ModuleClientWrapper'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const columns = [
    { key: 'invoiceNo', label: 'Invoice No.' },
    { key: 'client', label: 'Client' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' },
]

export default async function InvoicesPage() {
    const user = await getUserWithRole()
    let accessLevel: AccessLevel = 'view'

    if (user?.role === 'admin') {
        accessLevel = 'full'
    } else {
        const perm = user?.permissions?.find(p => p.module === 'invoices')
        if (perm) accessLevel = perm.access
    }

    const supabase = await createClient()
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('issue_date', { ascending: false })

    if (error) {
        console.warn('Note: Invoices table not ready or empty. Using fallback demo data.')
    }

    // Map DB fields to columns
    const formattedInvoices = invoices?.map(i => ({
        ...i,
        client: i.clients?.name || 'Unknown',
        issueDate: i.issue_date,
        dueDate: i.due_date,
        invoiceNo: i.invoice_no
    }))

    const displayData = (formattedInvoices && formattedInvoices.length > 0) ? formattedInvoices : DEMO_INVOICES

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-8 pt-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {user?.role === 'admin' ? "All Invoices" : "Invoice Records"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track your business billing.</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="flex items-center gap-2 bg-[#714b67] hover:bg-[#5a3c52] text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create Invoice
                </Link>
            </div>
            <ModuleClientWrapper
                title=""
                columns={columns}
                data={displayData as any}
                accessLevel={accessLevel}
            />
        </div>
    )
}
