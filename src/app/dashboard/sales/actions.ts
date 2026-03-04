'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Interfaces ---
export interface QuotationData {
    id?: string
    quotation_number: string
    client_id: number
    quotation_date: string
    expiration_date?: string
    payment_terms?: string
    subtotal: number
    tax_total: number
    grand_total: number
    status?: string
    notes?: string
}

export interface QuotationItemData {
    id?: string
    product_description: string
    quantity: number
    unit_price: number
    tax_rate: number
    total_price: number
    sort_order: number
}

/**
 * Fetch all quotations, including the client's name.
 */
export async function getQuotations() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('quotations')
            .select(`
                *,
                clients (name)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data }
    } catch (error: any) {
        console.error('Error fetching quotations:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fetch a single quotation by ID, including its line items.
 */
export async function getQuotationById(id: string) {
    try {
        const supabase = await createClient()

        const { data: quote, error: quoteError } = await supabase
            .from('quotations')
            .select(`
                *,
                clients (name, address, gst_number)
            `)
            .eq('id', id)
            .single()

        if (quoteError) throw quoteError

        const { data: items, error: itemsError } = await supabase
            .from('quotation_items')
            .select('*')
            .eq('quotation_id', id)
            .order('sort_order', { ascending: true })

        if (itemsError) throw itemsError

        return { success: true, data: { ...quote, items } }
    } catch (error: any) {
        console.error('Error fetching quotation:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Perform a transaction lookup or fallback manual inserts to create the quotation and its items.
 */
export async function createQuotation(quoteData: QuotationData, items: QuotationItemData[]) {
    try {
        const supabase = await createClient()

        // 1. Insert the main quotation
        const { data: newQuote, error: quoteError } = await supabase
            .from('quotations')
            .insert([{
                quotation_number: quoteData.quotation_number,
                client_id: quoteData.client_id,
                quotation_date: quoteData.quotation_date,
                expiration_date: quoteData.expiration_date || null,
                payment_terms: quoteData.payment_terms || null,
                subtotal: quoteData.subtotal,
                tax_total: quoteData.tax_total,
                grand_total: quoteData.grand_total,
                status: quoteData.status || 'Draft',
                notes: quoteData.notes || null
            }])
            .select()
            .single()

        if (quoteError) throw quoteError

        // 2. Prepare and insert line items
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                quotation_id: newQuote.id,
                product_description: item.product_description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                tax_rate: item.tax_rate,
                total_price: item.total_price,
                sort_order: item.sort_order
            }))

            const { error: itemsError } = await supabase
                .from('quotation_items')
                .insert(itemsToInsert)

            if (itemsError) {
                // Manual rollback if items fail
                await supabase.from('quotations').delete().eq('id', newQuote.id)
                throw itemsError
            }
        }

        revalidatePath('/dashboard/sales')
        return { success: true, data: newQuote }
    } catch (error: any) {
        console.error('Error creating quotation:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Update a quotation and sync its order lines.
 */
export async function updateQuotation(id: string, quoteData: QuotationData, items: QuotationItemData[]) {
    try {
        const supabase = await createClient()

        // 1. Update main quotation
        const { error: quoteError } = await supabase
            .from('quotations')
            .update({
                client_id: quoteData.client_id,
                quotation_date: quoteData.quotation_date,
                expiration_date: quoteData.expiration_date || null,
                payment_terms: quoteData.payment_terms || null,
                subtotal: quoteData.subtotal,
                tax_total: quoteData.tax_total,
                grand_total: quoteData.grand_total,
                status: quoteData.status,
                notes: quoteData.notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (quoteError) throw quoteError

        // 2. Simplest sync strategy for items: Delete all existing, insert new ones.
        // This avoids complex diffing for now, as order lines are usually small.
        const { error: deleteError } = await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', id)

        if (deleteError) throw deleteError

        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                quotation_id: id,
                product_description: item.product_description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                tax_rate: item.tax_rate,
                total_price: item.total_price,
                sort_order: item.sort_order
            }))

            const { error: itemsError } = await supabase
                .from('quotation_items')
                .insert(itemsToInsert)

            if (itemsError) throw itemsError
        }

        revalidatePath('/dashboard/sales')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating quotation:', error)
        return { success: false, error: error.message }
    }
}
