import React from 'react'
import { getQuotations } from './actions'
import QuotationsMasterTable from '@/components/sales/QuotationsMasterTable'
import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function SalesPage() {
    const userWithRole = await getUserWithRole()
    if (!userWithRole) {
        redirect('/login')
    }

    // Fetch initial list of quotations
    const { data: quotationsData, success } = await getQuotations()
    const quotations = success ? quotationsData || [] : []

    // Pre-fetch active clients so the QuotationForm dropdown has them ready
    let clients: any[] = []
    try {
        const supabase = await createClient()
        const { data } = await supabase.from('clients').select('id, name, address, gst_number')
        if (data) clients = data
    } catch (e) {
        console.error("Failed to fetch clients for dropdown", e)
    }

    return (
        <div className="flex-1 min-w-0 h-screen overflow-y-auto bg-slate-50 relative p-4 md:p-8">
            <QuotationsMasterTable initialQuotations={quotations!} clients={clients} accessLevel={userWithRole.role} />
        </div>
    )
}
