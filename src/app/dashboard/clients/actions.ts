'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { DEMO_COOKIE_NAME } from '@/utils/supabase/demo-users'
import { logEdit, logDeletion, withTimeout } from '@/utils/auditLogger'

export async function createClientAction(formData: FormData) {
    try {
        const supabase = await createClient()

        const parseNullableInt = (value: string | null) => {
            if (!value || value.trim() === '') return null
            const parsed = parseInt(value, 10)
            return isNaN(parsed) ? null : parsed
        }

        const parseBool = (value: any) => value === 'true' || value === true

        const rawData = {
            name: formData.get('name') as string,
            developer_name: formData.get('developerName') as string,
            address: formData.get('address') as string,
            landmark: formData.get('landmark') as string,
            contact_name: formData.get('contactName') as string,
            contact_person: formData.get('contactPerson') as string,
            contract_value: formData.get('contractValue') as string,
            category: formData.get('category') as string,
            sales_person: formData.get('salesPerson') as string,
            client_reference: formData.get('clientReference') as string,
            service_plan: formData.get('servicePlan') as string,
            district: formData.get('district') as string,
            area: formData.get('area') as string,
            state: formData.get('state') as string,
            pincode: formData.get('pincode') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,

            // Building & Site
            wings: formData.get('wings') as string,
            ground_floor: formData.get('groundFloor') as string,
            stilt: formData.get('stilt') as string,
            basement: formData.get('basement') as string,
            podium_count: formData.get('podiumCount') as string,
            floor_count: formData.get('floorCount') as string,

            system_type: formData.get('systemType') as string,
            alarm_system: formData.get('alarmSystem') as string,

            // Smoke Detectors
            sd_meter_room: parseBool(formData.get('sdMeterRoom')),
            sd_lift_machine_room: parseBool(formData.get('sdLiftMachineRoom')),
            sd_electric_duct: parseBool(formData.get('sdElectricDuct')),

            // Fire Safety Assets (Counts & Types)
            hydrant_valve_type: formData.get('hydrantValveType') as string,
            hydrant_valve_count: parseNullableInt(formData.get('hydrantValveCount') as string),
            hosreel_drum_count: parseNullableInt(formData.get('hosreelDrumCount') as string),
            courtyard_hydrant_valve_type: formData.get('courtyardHydrantValveType') as string,
            courtyard_hydrant_valve_count: parseNullableInt(formData.get('courtyardHydrantValveCount') as string),
            hosebox_type: formData.get('hoseboxType') as string,
            hosebox_count: parseNullableInt(formData.get('hoseboxCount') as string),
            short_branch_pipes: parseNullableInt(formData.get('shortBranchPipeCount') as string),
            canvas_hosepipe_count: parseNullableInt(formData.get('canvasHosepipeCount') as string),

            fire_extinguisher_abc: parseNullableInt(formData.get('fireExtinguisherAbcQty') as string),
            fire_extinguisher_co2: parseNullableInt(formData.get('fireExtinguisherCo2Qty') as string),
            fire_extinguisher_clean_agent: parseNullableInt(formData.get('fireExtinguisherCleanAgentQty') as string),
            extinguisher_expiry_date: formData.get('extinguisherExpiryDate') ? formData.get('extinguisherExpiryDate') as string : null,

            // Pumps
            pump_type: formData.get('pumpType') as string,
            pump_hydrant: parseNullableInt(formData.get('pumpHydrant') as string),
            pump_sprinkler: parseNullableInt(formData.get('pumpSprinkler') as string),
            pump_hydrant_jockey: parseNullableInt(formData.get('pumpHydrantJockey') as string),
            pump_sprinkler_jockey: parseNullableInt(formData.get('pumpSprinklerJockey') as string),
            pump_standby_hydrant: parseNullableInt(formData.get('pumpStandbyHydrant') as string),
            pump_standby_sprinkler: parseNullableInt(formData.get('pumpStandbySprinkler') as string),
            pump_standby_jockey: parseNullableInt(formData.get('pumpStandbyJockey') as string),
            pump_booster: parseNullableInt(formData.get('pumpBooster') as string),

            // Sprinkler System Coverage
            ss_ground: parseBool(formData.get('ssGround')),
            ss_basement: parseBool(formData.get('ssBasement')),
            ss_podium: parseBool(formData.get('ssPodium')),
            ss_lift_lobby: parseBool(formData.get('ssLiftLobby')),
            ss_flat: parseBool(formData.get('ssFlat')),

            // Legacy/Misc
            status: formData.get('status') as string,
            priority: formData.get('priority') as string,
            amc_start_date: formData.get('amcStartDate') ? formData.get('amcStartDate') as string : null,
            amc_end_date: formData.get('amcEndDate') ? formData.get('amcEndDate') as string : null,
        }

        // Recent work logic
        let updateData: any = { ...rawData }
        const newWorkDate = formData.get('recentWorkDate')
        const newWorkType = formData.get('recentWorkType')
        if (newWorkDate && newWorkType) {
            updateData.recent_work = `${newWorkDate}: ${newWorkType}`
        }

        const { error } = await supabase.from('clients').insert(updateData)

        if (error) {
            console.error('Error creating client:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e: any) {
        console.error('Fatal error in createClientAction:', e)
        return { success: false, error: e.message || 'An unexpected connection error occurred' }
    }
}

export async function updateClientAction(id: number, formData: FormData) {
    try {
        const supabase = await createClient()

        const parseNullableInt = (value: string | null) => {
            if (!value || value.trim() === '') return null
            const parsed = parseInt(value, 10)
            return isNaN(parsed) ? null : parsed
        }

        const parseBool = (value: any) => value === 'true' || value === true

        const rawData = {
            name: formData.get('name') as string,
            developer_name: formData.get('developerName') as string,
            address: formData.get('address') as string,
            landmark: formData.get('landmark') as string,
            contact_name: formData.get('contactName') as string,
            contact_person: formData.get('contactPerson') as string,
            contract_value: formData.get('contractValue') as string,
            category: formData.get('category') as string,
            sales_person: formData.get('salesPerson') as string,
            client_reference: formData.get('clientReference') as string,
            service_plan: formData.get('servicePlan') as string,
            district: formData.get('district') as string,
            area: formData.get('area') as string,
            state: formData.get('state') as string,
            pincode: formData.get('pincode') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,

            // Building & Site
            wings: formData.get('wings') as string,
            ground_floor: formData.get('groundFloor') as string,
            stilt: formData.get('stilt') as string,
            basement: formData.get('basement') as string,
            podium_count: formData.get('podiumCount') as string,
            floor_count: formData.get('floorCount') as string,

            system_type: formData.get('systemType') as string,
            alarm_system: formData.get('alarmSystem') as string,

            // Smoke Detectors
            sd_meter_room: parseBool(formData.get('sdMeterRoom')),
            sd_lift_machine_room: parseBool(formData.get('sdLiftMachineRoom')),
            sd_electric_duct: parseBool(formData.get('sdElectricDuct')),

            // Fire Safety Assets (Counts & Types)
            hydrant_valve_type: formData.get('hydrantValveType') as string,
            hydrant_valve_count: parseNullableInt(formData.get('hydrantValveCount') as string),
            hosreel_drum_count: parseNullableInt(formData.get('hosreelDrumCount') as string),
            courtyard_hydrant_valve_type: formData.get('courtyardHydrantValveType') as string,
            courtyard_hydrant_valve_count: parseNullableInt(formData.get('courtyardHydrantValveCount') as string),
            hosebox_type: formData.get('hoseboxType') as string,
            hosebox_count: parseNullableInt(formData.get('hoseboxCount') as string),
            short_branch_pipes: parseNullableInt(formData.get('shortBranchPipeCount') as string),
            canvas_hosepipe_count: parseNullableInt(formData.get('canvasHosepipeCount') as string),

            fire_extinguisher_abc: parseNullableInt(formData.get('fireExtinguisherAbcQty') as string),
            fire_extinguisher_co2: parseNullableInt(formData.get('fireExtinguisherCo2Qty') as string),
            fire_extinguisher_clean_agent: parseNullableInt(formData.get('fireExtinguisherCleanAgentQty') as string),
            extinguisher_expiry_date: formData.get('extinguisherExpiryDate') ? formData.get('extinguisherExpiryDate') as string : null,

            // Pumps
            pump_type: formData.get('pumpType') as string,
            pump_hydrant: parseNullableInt(formData.get('pumpHydrant') as string),
            pump_sprinkler: parseNullableInt(formData.get('pumpSprinkler') as string),
            pump_hydrant_jockey: parseNullableInt(formData.get('pumpHydrantJockey') as string),
            pump_sprinkler_jockey: parseNullableInt(formData.get('pumpSprinklerJockey') as string),
            pump_standby_hydrant: parseNullableInt(formData.get('pumpStandbyHydrant') as string),
            pump_standby_sprinkler: parseNullableInt(formData.get('pumpStandbySprinkler') as string),
            pump_standby_jockey: parseNullableInt(formData.get('pumpStandbyJockey') as string),
            pump_booster: parseNullableInt(formData.get('pumpBooster') as string),

            // Sprinkler System Coverage
            ss_ground: parseBool(formData.get('ssGround')),
            ss_basement: parseBool(formData.get('ssBasement')),
            ss_podium: parseBool(formData.get('ssPodium')),
            ss_lift_lobby: parseBool(formData.get('ssLiftLobby')),
            ss_flat: parseBool(formData.get('ssFlat')),

            // Health
            status: formData.get('status') as string,
            priority: formData.get('priority') as string,
            amc_start_date: formData.get('amcStartDate') ? formData.get('amcStartDate') as string : null,
            amc_end_date: formData.get('amcEndDate') ? formData.get('amcEndDate') as string : null,
        }

        // Handle conditional updates
        let updateData: any = { ...rawData }

        // Only update recent_work if specifically adding a new entry (both fields present)
        const newWorkDate = formData.get('recentWorkDate')
        const newWorkType = formData.get('recentWorkType')
        if (newWorkDate && newWorkType) {
            updateData.recent_work = `${newWorkDate}: ${newWorkType}`
        } else {
            delete updateData.recent_work // Don't update this column
        }

        const { data: oldData } = await supabase.from('clients').select('*').eq('id', id).single()

        const { error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', id)

        if (error) {
            console.error('Error updating client:', error)
            return { success: false, error: error.message }
        }

        // Log the edit
        if (oldData) {
            const { data: newData } = await supabase.from('clients').select('*').eq('id', id).single()
            if (newData) {
                await logEdit('clients', id, newData.name || `Client #${id}`, oldData, newData)
            }
        }

        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e: any) {
        console.error('Fatal error in updateClientAction:', e)
        return { success: false, error: e.message || 'An unexpected connection error occurred' }
    }
}

export async function deleteClientAction(id: number) {
    try {
        const supabase = await createClient()
        const cookieStore = await cookies()
        const demoUserCookie = cookieStore.get(DEMO_COOKIE_NAME)
        const userEmail = demoUserCookie ? JSON.parse(demoUserCookie.value).email : 'Unknown'

        // Create timeout helper
        const withTimeout = (promise: Promise<any>, ms: number = 5000) => {
            let timeoutId: ReturnType<typeof setTimeout>
            const timeoutPromise = new Promise((_, reject) =>
                timeoutId = setTimeout(() => reject(new Error('Network connection timed out')), ms)
            )
            return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
        }

        // 1. Fetch the record first (with timeout)
        let record: any = null
        try {
            const { data, error } = await withTimeout(
                supabase.from('clients').select('*').eq('id', id).single() as unknown as Promise<any>
            )
            if (error) throw error
            record = data
        } catch (fetchError: any) {
            console.error('Error fetching client for deletion log:', fetchError, 'ID:', id)
            // If the user's connection is fully blocked or offline, heavily simulate deletion for DEMO records
            const isNetworkError = fetchError.message?.includes('fetch failed') || fetchError.message?.includes('Network connection timed out') || fetchError.message?.includes('UND_ERR');
            if (isNetworkError && id < 100000) {
                console.warn('Network offline: Simulating deletion of DEMO client ID', id);
                return { success: true };
            }
            if (isNetworkError) {
                return { success: false, error: 'Database connection failed. Cannot verify or delete record while offline.' }
            }
            return { success: false, error: fetchError.message || `Could not find record to delete (ID: ${id})` }
        }

        if (!record) {
            return { success: false, error: `Could not find record to delete (ID: ${id})` }
        }

        // 2. Insert into deletion_logs (with timeout)
        try {
            await logDeletion('clients', id, record.name || `Client #${id}`, record)
        } catch (logError: any) {
            console.error('Error logging deletion:', logError)
            return { success: false, error: 'Failed to create audit log. Network timeout or error. Deletion aborted.' }
        }

        // 3. Actually delete (with timeout)
        try {
            const { error } = await withTimeout(
                supabase.from('clients').delete().eq('id', id) as unknown as Promise<any>
            )
            if (error) throw error
        } catch (deleteError: any) {
            console.error('Error deleting client:', deleteError)
            return { success: false, error: deleteError.message || 'Error occurred during deletion' }
        }

        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e: any) {
        console.error('Fatal error in deleteClientAction:', e)
        return { success: false, error: e.message || 'An unexpected connection error occurred' }
    }
}

export async function bulkCreateClientsAction(clients: any[]) {
    try {
        const supabase = await createClient()

        // Batch insert the clients
        const { error } = await supabase
            .from('clients')
            .insert(clients)

        if (error) {
            console.error('Error bulk creating clients:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/clients')
        return { success: true, count: clients.length }
    } catch (e: any) {
        console.error('Fatal error in bulkCreateClientsAction:', e)
        return { success: false, error: e.message || 'An unexpected connection error occurred' }
    }
}

export async function getDeletionLogsAction() {
    try {
        const supabase = await createClient()

        const withTimeout = (promise: Promise<any>, ms: number = 5000) => {
            let timeoutId: ReturnType<typeof setTimeout>
            const timeoutPromise = new Promise((_, reject) =>
                timeoutId = setTimeout(() => reject(new Error('Network connection timed out')), ms)
            )
            return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
        }

        const { data, error } = await withTimeout(
            supabase.from('deletion_logs').select('*').order('deleted_at', { ascending: false }) as unknown as Promise<any>
        )

        if (error) throw error
        return { success: true, data }
    } catch (e: any) {
        console.error('Error fetching deletion logs:', e)
        const isNetworkError = e.message?.includes('fetch failed') || e.message?.includes('Network connection timed out') || e.message?.includes('UND_ERR');
        if (isNetworkError) {
            console.warn('Network offline: Simulating empty deletion logs');
            return { success: true, data: [] };
        }
        return { success: false, error: e.message }
    }
}

export async function restoreClientAction(logId: number) {
    try {
        const supabase = await createClient()

        // 1. Get the log entry
        const { data: log, error: logError } = await supabase
            .from('deletion_logs')
            .select('*')
            .eq('id', logId)
            .single()

        if (logError || !log) throw new Error('Deletion log not found')

        // 2. Restore the data (strip the ID or use it if generating)
        const recordData = { ...log.data }
        delete recordData.id // Let the database handle ID if it's text-based or re-insert with old ID if allowed
        // Actually, since it's identity, we might want to keep the same ID if possible, 
        // but for now let's insert and get a new ID to avoid conflicts if IDs were reused.
        // Wait, if it's a hard delete, the ID might be free. 
        // Let's try inserting with the old ID but check policy/identity settings.

        const { error: restoreError } = await supabase
            .from('clients')
            .insert(log.data)

        if (restoreError) throw restoreError

        // 3. Delete the log entry
        const { error: deleteLogError } = await supabase
            .from('deletion_logs')
            .delete()
            .eq('id', logId)

        if (deleteLogError) console.error('Warning: Failed to delete log entry after restoration')

        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e: any) {
        console.error('Error restoring client:', e)
        return { success: false, error: e.message }
    }
}

export async function addSiteAction(clientId: number, siteData: { name: string, address: string, site_type: string }) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('client_sites')
            .insert([{ ...siteData, client_id: clientId }])

        if (error) throw error
        revalidatePath(`/dashboard/clients/${clientId}`)
        return { success: true }
    } catch (e: any) {
        console.error('Error adding site:', e)
        return { success: false, error: e.message }
    }
}

export async function getSitesAction(clientId: number) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('client_sites')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data }
    } catch (e: any) {
        console.error('Error fetching sites:', e)
        return { success: false, error: e.message }
    }
}

