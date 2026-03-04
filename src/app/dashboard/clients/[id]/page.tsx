import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { DEMO_CLIENTS } from '@/utils/demo-data'
import Client360View from '@/components/clients/Client360View'
import { notFound } from 'next/navigation'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithRole()
    const supabase = await createClient()

    // Attempt to fetch specific client
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    let displayClient = client

    // Fallback to demo data if not found or error
    if (error || !client) {
        displayClient = DEMO_CLIENTS.find(c => String(c.id) === id)
    }

    if (!displayClient) {
        // Last ditch effort: if it's a numeric demo ID but we're searching GUIDs
        // Or vice versa, common in development
        const demoIndex = parseInt(id)
        if (!isNaN(demoIndex) && DEMO_CLIENTS[demoIndex % DEMO_CLIENTS.length]) {
            displayClient = DEMO_CLIENTS[demoIndex % DEMO_CLIENTS.length]
        }
    }

    if (!displayClient) {
        notFound()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Client360View
                client={displayClient}
                accessLevel={user?.role === 'admin' ? 'full' : 'view'}
            />
        </div>
    )
}
