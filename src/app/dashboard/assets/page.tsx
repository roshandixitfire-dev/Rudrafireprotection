import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AssetsClientView from './AssetsClientView'
import { getUserWithRole } from '@/utils/supabase/auth'

export default async function AssetsPage() {
    const supabase = await createClient()

    // 1. Verify user role (support demo data)
    const userWithRole = await getUserWithRole()
    if (!userWithRole) {
        redirect('/login')
    }

    const accessLevel = userWithRole.role

    // We fetch initial asset data. If it fails due to network offline mode,
    // we degrade gracefully just like the dashboard/clients does.
    let assets: any[] = []
    let clients: any[] = []
    let equipment: any[] = []

    try {
        const withTimeout = (promise: Promise<any>, ms: number = 8000) => {
            let timeoutId: ReturnType<typeof setTimeout>
            const timeoutPromise = new Promise((_, reject) =>
                timeoutId = setTimeout(() => reject(new Error('Network connection timed out')), ms)
            )
            return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
        }

        // Fetch Assets
        const { data: assetsData, error: assetsError } = await withTimeout(
            supabase.from('client_assets')
                .select(`
                *,
                clients (name),
                equipment_master (category, make_model)
            `)
                .order('created_at', { ascending: false }) as unknown as Promise<any>
        )
        if (!assetsError && assetsData) {
            assets = assetsData
        }

        // Fetch Clients for the dropdown in AssetForm
        const { data: clientsData, error: clientsError } = await withTimeout(
            supabase.from('clients').select('id, name') as unknown as Promise<any>
        )
        if (!clientsError && clientsData) {
            clients = clientsData
        }

        // Fetch Equipment for the dropdown in AssetForm
        const { data: equipmentData, error: equipmentError } = await withTimeout(
            supabase.from('equipment_master').select('*') as unknown as Promise<any>
        )
        if (!equipmentError && equipmentData) {
            equipment = equipmentData
        }

    } catch (e: any) {
        console.warn('Network issue detected fetching assets. Operating in offline demo mode.')
        // In a real scenario, you'd fallback to mock data here testing.
        // For now, we will just pass empty arrays and let the UI inform the user.
    }

    return (
        <div className="w-[calc(100vw-300px)] h-screen overflow-y-auto bg-slate-50 relative">
            <AssetsClientView
                initialData={assets}
                clients={clients}
                equipment={equipment}
                accessLevel={accessLevel}
            />
        </div>
    )
}
