import React from 'react'
import { getQuotations, getInvoices } from './actions'
import SalesHub from '@/components/sales/SalesHub'
import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function SalesPage() {
    const userWithRole = await getUserWithRole()
    if (!userWithRole) {
        redirect('/login')
    }

    // Fetch quotations
    const { data: quotationsData, success: quotationsOk } = await getQuotations()
    const quotations = quotationsOk ? quotationsData || [] : []

    // Fetch invoices
    const { data: invoicesData, success: invoicesOk } = await getInvoices()
    const invoices = invoicesOk ? (invoicesData as any[]) || [] : []

    // Fetch clients for dropdown
    let clients: any[] = []
    try {
        const supabase = await createClient()
        const { data } = await supabase.from('clients').select('id, name, address, gst_number')
        if (data) clients = data
    } catch {
        // non-fatal
    }

    return (
        <div className="flex-1 min-w-0 bg-slate-50 relative p-4 md:p-8">
            <SalesHub
                quotations={quotations as any[]}
                invoices={invoices}
                clients={clients}
                accessLevel={userWithRole.role}
            />
        </div>
    )
}
