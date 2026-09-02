import { createClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/supabase/auth'
import { AccessLevel, DEMO_USERS } from '@/utils/supabase/demo-users'
import VendorsSSRWrapper from './VendorsSSRWrapper'

export default async function VendorsPage() {
    const userData = await getUserWithRole()

    // Determine access level (matching clients page access control)
    let accessLevel: AccessLevel = 'view'
    if (userData?.role === 'admin') accessLevel = 'full'
    else if (userData?.role === 'employee') accessLevel = 'edit'

    if (userData?.user.email && DEMO_USERS[userData.user.email]) {
        const perm = DEMO_USERS[userData.user.email].permissions.find((p: any) => p.module === 'vendors')
        if (perm) accessLevel = perm.access
    }

    let initialVendors: any[] = []
    let initialPOs: any[] = []
    let useDb = false

    try {
        const supabase = await createClient()
        
        // Fetch vendors from Supabase (with a short timeout fallback)
        const vendorsPromise = supabase
            .from('vendors')
            .select('*')
            .order('name', { ascending: true })

        // Fetch POs from Supabase
        const posPromise = supabase
            .from('purchase_orders')
            .select('*, vendors(name)')
            .order('created_at', { ascending: false })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timed out')), 4000)
        )

        const [vendorsResult, posResult] = await Promise.all([
            Promise.race([vendorsPromise, timeoutPromise]),
            Promise.race([posPromise, timeoutPromise])
        ]) as any

        if (vendorsResult.error || posResult.error) {
            throw new Error(vendorsResult.error?.message || posResult.error?.message)
        }

        initialVendors = vendorsResult.data || []
        initialPOs = posResult.data || []
        useDb = true
    } catch (e: any) {
        console.warn('Vendors/POs Database Fetch Failed. Falling back to local storage:', e.message)
    }

    return (
        <VendorsSSRWrapper
            initialVendors={initialVendors}
            initialPOs={initialPOs}
            accessLevel={accessLevel}
            useDb={useDb}
        />
    )
}
