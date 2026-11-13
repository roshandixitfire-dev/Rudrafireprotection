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

        const { data: proQuotes } = await supabase
            .from('quotations')
            .select(`
                *,
                clients (name)
            `)

        const { data: legacyQuotes } = await supabase
            .from('legacy_quotations')
            .select('*')

        const { data: amcQuotes } = await supabase
            .from('amc_quotations')
            .select('*')

        const combined: any[] = []
        if (proQuotes) {
            combined.push(...proQuotes.map(q => ({ ...q, type: 'professional' })))
        }
        if (legacyQuotes) {
            combined.push(...legacyQuotes.map(q => ({ ...q, type: 'legacy' })))
        }
        if (amcQuotes) {
            combined.push(...amcQuotes.map(q => ({ ...q, type: 'amc' })))
        }

        combined.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime()
            const dateB = new Date(b.created_at || 0).getTime()
            return dateB - dateA
        })

        return { success: true, data: combined }
    } catch (error: any) {
        console.error('Error fetching quotations:', error?.message || error, error?.stack)
        return { success: false, error: error?.message || 'Unknown error', data: [] }
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

/**
 * Fetch all invoices (legacy_invoices table used by the invoice form).
 */
export async function getInvoices() {
    try {
        const supabase = await createClient()
        // Primary: legacy_invoices (used by LegacyInvoiceModule)
        const { data: legacyData, error: legacyError } = await supabase
            .from('legacy_invoices')
            .select('*, clients(name)')
            .order('invoice_date', { ascending: false })

        if (legacyError) {
            // Fallback: try old invoices table
            const { data: fallback } = await supabase
                .from('invoices')
                .select('*, clients(name)')
                .order('issue_date', { ascending: false })
            return { success: true, data: fallback || [] }
        }

        return { success: true, data: legacyData || [] }
    } catch (error: any) {
        console.error('Error fetching invoices:', error?.message || error, error?.stack)
        return { success: false, error: error?.message || 'Unknown error', data: [] }
    }
}

/**
 * Delete a quotation by ID.
 */
export async function deleteQuotation(id: string) {
    try {
        const supabase = await createClient()
        // Delete items first (FK constraint for professional quotes)
        await supabase.from('quotation_items').delete().eq('quotation_id', id)
        await supabase.from('quotations').delete().eq('id', id)
        await supabase.from('legacy_quotations').delete().eq('id', id)
        await supabase.from('amc_quotations').delete().eq('id', id)
        revalidatePath('/dashboard/sales')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting quotation:', error)
        return { success: false, error: error.message }
    }
}

const getFYLabel = (): string => {
    const d = new Date()
    const month = d.getMonth()
    const year = d.getFullYear()
    const startYear = month >= 3 ? year : year - 1
    const endYear = startYear + 1
    return `${String(startYear).slice(2)}-${String(endYear).slice(2)}`
}

/**
 * Duplicate a quotation by ID (supports legacy, professional, amc).
 */
export async function duplicateQuotation(id: string, recordType?: string) {
    try {
        const supabase = await createClient()
        const fyLabel = getFYLabel()
        const today = new Date().toISOString().split('T')[0]

        // 1. Try legacy_quotations
        if (recordType === 'legacy' || !recordType) {
            const { data: legQuote } = await supabase.from('legacy_quotations').select('*').eq('id', id).maybeSingle()
            if (legQuote) {
                const { data: seq } = await supabase.rpc('next_doc_sequence', { p_key: `quote-${fyLabel}` })
                const num = seq || Math.floor(1000 + Math.random() * 9000)
                const newQuoteNo = `RFP/${fyLabel}/${String(num).padStart(5, '0')}`

                const raw = JSON.parse(JSON.stringify(legQuote.raw_json || {}))
                raw.quoteNo = newQuoteNo
                raw.date = today
                if (Array.isArray(raw.items)) {
                    raw.items = raw.items.map((it: any, idx: number) => ({
                        ...it,
                        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`
                    }))
                }

                const { data: newQuote, error: insertError } = await supabase.from('legacy_quotations').insert([{
                    quote_no: newQuoteNo,
                    quote_date: today,
                    status: 'Draft',
                    client_id: legQuote.client_id,
                    to_title: legQuote.to_title,
                    company_name: legQuote.company_name,
                    street: legQuote.street,
                    location: legQuote.location,
                    city: legQuote.city,
                    state: legQuote.state,
                    pin: legQuote.pin,
                    subtotal: legQuote.subtotal,
                    sgst_pct: legQuote.sgst_pct,
                    cgst_pct: legQuote.cgst_pct,
                    sgst_amount: legQuote.sgst_amount,
                    cgst_amount: legQuote.cgst_amount,
                    grand_total: legQuote.grand_total,
                    raw_json: raw,
                    created_by: legQuote.created_by
                }]).select().single()

                if (insertError) throw insertError
                revalidatePath('/dashboard/sales')
                return { success: true, data: { ...newQuote, recordType: 'legacy' } }
            }
        }

        // 2. Try professional quotations
        if (recordType === 'professional' || !recordType) {
            const { data: proQuote } = await supabase.from('quotations').select('*').eq('id', id).maybeSingle()
            if (proQuote) {
                const { data: seq } = await supabase.rpc('next_doc_sequence', { p_key: `qtn-prof-${fyLabel}` })
                const num = seq || Math.floor(1000 + Math.random() * 9000)
                const newQuoteNo = `Rudra/QTN/${fyLabel}/${String(num).padStart(4, '0')}`

                const raw = JSON.parse(JSON.stringify(proQuote.raw_json || {}))
                raw.quotationNo = newQuoteNo
                raw.date = today

                const { id: _oldId, created_at: _c, updated_at: _u, ...rest } = proQuote
                const { data: newQuote, error: insertError } = await supabase.from('quotations').insert([{
                    ...rest,
                    quotation_number: newQuoteNo,
                    quotation_date: today,
                    status: 'Draft',
                    raw_json: raw
                }]).select().single()

                if (insertError) throw insertError

                const { data: items } = await supabase.from('quotation_items').select('*').eq('quotation_id', id)
                if (items && items.length > 0) {
                    await supabase.from('quotation_items').insert(
                        items.map((it: any) => {
                            const { id: _itemId, ...itemRest } = it
                            return { ...itemRest, quotation_id: newQuote.id }
                        })
                    )
                }

                revalidatePath('/dashboard/sales')
                return { success: true, data: { ...newQuote, recordType: 'professional' } }
            }
        }

        // 3. Try AMC quotations
        if (recordType === 'amc' || !recordType) {
            const { data: amcQuote } = await supabase.from('amc_quotations').select('*').eq('id', id).maybeSingle()
            if (amcQuote) {
                const { data: seq } = await supabase.rpc('next_doc_sequence', { p_key: `qtn-amc-${fyLabel}` })
                const num = seq || Math.floor(1000 + Math.random() * 9000)
                const newQuoteNo = `AMC/${fyLabel}/${String(num).padStart(4, '0')}`

                const { id: _oldId, created_at: _c, updated_at: _u, ...rest } = amcQuote
                const { data: newQuote, error: insertError } = await supabase.from('amc_quotations').insert([{
                    ...rest,
                    quotation_number: newQuoteNo,
                    quotation_date: today,
                    status: 'Draft'
                }]).select().single()

                if (insertError) throw insertError
                revalidatePath('/dashboard/sales')
                return { success: true, data: { ...newQuote, recordType: 'amc' } }
            }
        }

        return { success: false, error: 'Quotation not found' }
    } catch (error: any) {
        console.error('Error duplicating quotation:', error)
        return { success: false, error: error.message || 'Failed to duplicate quotation' }
    }
}

/**
 * Delete an invoice by ID.
 */
export async function deleteInvoice(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('legacy_invoices').delete().eq('id', id)
        await supabase.from('invoices').delete().eq('id', id)
        
        if (error) {
            console.error('Legacy Invoice delete error:', error)
        }
        revalidatePath('/dashboard/sales')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting invoice:', error)
        return { success: false, error: error.message }
    }
}

export async function updateQuotationStatus(id: string, status: string) {
    try {
        const supabase = await createClient()
        await Promise.all([
            supabase.from('quotations').update({ status }).eq('id', id),
            supabase.from('legacy_quotations').update({ status }).eq('id', id),
            supabase.from('amc_quotations').update({ status }).eq('id', id),
            supabase.from('legacy_invoices').update({ status }).eq('id', id),
            supabase.from('invoices').update({ status }).eq('id', id)
        ])
        
        revalidatePath('/dashboard/sales')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating status:', error)
        return { success: false, error: error.message }
    }
}

export async function payInvoice(id: string, paymentData: any) {
    try {
        const supabase = await createClient()
        
        const { error: e1 } = await supabase.from('legacy_invoices')
            .update({ status: 'Paid', payment_details: paymentData })
            .eq('id', id)
            
        const { error: e2 } = await supabase.from('invoices')
            .update({ status: 'Paid', payment_details: paymentData })
            .eq('id', id)
        
        revalidatePath('/dashboard/sales')
        return { success: true }
    } catch (error: any) {
        console.error('Error mapping payment:', error)
        return { success: false, error: error.message }
    }
}
