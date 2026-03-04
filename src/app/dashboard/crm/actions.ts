'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logEdit, logDeletion } from '@/utils/auditLogger'

export async function getLeadsAction() {
    try {
        console.log('Fetching leads...')
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Undefined')
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('sr_no', { ascending: true })

        if (error) {
            console.error('Supabase error:', error)
            throw error
        }
        console.log(`Fetched ${data?.length || 0} leads`)
        return { success: true, data }
    } catch (e: any) {
        console.error('Detailed error fetching leads:', {
            name: e?.name,
            message: e?.message,
            stack: e?.stack,
            error: e
        })
        return { success: false, error: e?.message || 'Unknown error' }
    }
}

export async function createLeadAction(formData: FormData) {
    try {
        const supabase = await createClient()
        const data = Object.fromEntries(formData.entries())

        const { error } = await supabase.from('leads').insert(data)

        if (error) {
            console.error('Error creating lead:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/crm')
        return { success: true }
    } catch (e: any) {
        console.error('Fatal error in createLeadAction:', e)
        return { success: false, error: e.message }
    }
}

export async function updateLeadAction(id: number, formData: FormData) {
    try {
        const supabase = await createClient()
        const data = Object.fromEntries(formData.entries())

        const { data: oldData } = await supabase.from('leads').select('*').eq('id', id).single()

        const { error } = await supabase
            .from('leads')
            .update(data)
            .eq('id', id)

        if (error) {
            console.error('Error updating lead:', error)
            return { success: false, error: error.message }
        }

        if (oldData) {
            const { data: newData } = await supabase.from('leads').select('*').eq('id', id).single()
            if (newData) await logEdit('leads', id, newData.company_name || `Lead #${id}`, oldData, newData)
        }

        revalidatePath('/dashboard/crm')
        return { success: true }
    } catch (e: any) {
        console.error('Fatal error in updateLeadAction:', e)
        return { success: false, error: e.message }
    }
}

export async function deleteLeadAction(id: number) {
    try {
        const supabase = await createClient()
        const { data: record } = await supabase.from('leads').select('*').eq('id', id).single()

        const { error } = await supabase.from('leads').delete().eq('id', id)

        if (error) throw error

        if (record) {
            await logDeletion('leads', id, record.company_name || `Lead #${id}`, record)
        }

        revalidatePath('/dashboard/crm')
        return { success: true }
    } catch (e: any) {
        console.error('Error deleting lead:', e)
        return { success: false, error: e.message }
    }
}

export async function bulkCreateLeadsAction(leads: any[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('leads').insert(leads)

        if (error) throw error
        revalidatePath('/dashboard/crm')
        return { success: true, count: leads.length }
    } catch (e: any) {
        console.error('Error bulk creating leads:', e)
        return { success: false, error: e.message }
    }
}

export async function convertLeadToClientAction(leadId: number) {
    try {
        const supabase = await createClient()

        // 1. Fetch Lead data
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single()

        if (leadError || !lead) throw new Error('Lead not found')

        // 2. Map Lead to Client schema
        const clientData = {
            name: lead.project_name || 'Converted Lead',
            developer_name: lead.developer || '',
            address: lead.location || '',
            contact_name: lead.owner_name || '',
            contact_person: lead.finalizing_authority || lead.site_incharge || '',
            status: 'Active',
            priority: 'Medium',
            category: 'New', // Default category for new clients converted from leads
            recent_work: `Lead converted on ${new Date().toLocaleDateString()}`,
            // Map configuration fields if they exist in lead (using the names from the form)
            wings: lead.wings || '',
            floor_count: lead.floors || '',
            basement: lead.basement || '',
            stilt: lead.stilt || '',
            ground_floor: lead.ground || '',
        }

        // 3. Insert into Clients
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single()

        if (clientError) {
            console.error('Error creating client from lead:', clientError)
            throw clientError
        }

        // 4. Update Lead with a reference or a flag
        // For now, we'll just update a remark or stage
        const { error: updateError } = await supabase
            .from('leads')
            .update({ remarks: (lead.remarks || '') + `\n[System: Converted to Client ID: ${client.id}]` })
            .eq('id', leadId)

        if (updateError) console.error('Warning: Failed to update lead remarks after conversion')

        revalidatePath('/dashboard/crm')
        revalidatePath('/dashboard/clients')

        return { success: true, clientId: client.id }
    } catch (e: any) {
        console.error('Conversion error:', e)
        return { success: false, error: e.message }
    }
}
