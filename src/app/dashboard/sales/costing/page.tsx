import React from 'react'
import CostingModule from '@/components/sales/CostingModule'
import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function CostingPage() {
    const userWithRole = await getUserWithRole()
    if (!userWithRole) {
        redirect('/login')
    }

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
            <CostingModule clients={clients} />
        </div>
    )
}
