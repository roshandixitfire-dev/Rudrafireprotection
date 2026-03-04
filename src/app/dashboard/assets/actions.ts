'use server'

import { createClient } from '@/utils/supabase/server'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { logEdit, logDeletion } from '@/utils/auditLogger'

// 1. Create Asset & Generate QR Code
export async function createAndGenerateAssetQR(data: {
    client_id: number;
    equipment_id: string;
    manual_asset_tag?: string;
    exact_location: string;
    installation_date: string;
}) {
    const supabase = await createClient()

    // Generate a secure, unique hash for the QR code
    const uniqueString = `${data.client_id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const qrCodeHash = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 16)

    // Insert into database
    const { data: asset, error } = await supabase
        .from('client_assets')
        .insert({
            ...data,
            qr_code_hash: qrCodeHash,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating asset:', error);
        return { success: false, error: error.message }
    }

    // Generate Base64 Data URI for the QR Code containing the hash
    try {
        const qrContent = `RUDRA-ASSET:${qrCodeHash}`;
        const qrDataUri = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300
        });

        revalidatePath('/dashboard/assets');
        return { success: true, asset, qrCodeImage: qrDataUri }
    } catch (qrErr: any) {
        return { success: false, error: 'Failed to generate QR image: ' + qrErr.message }
    }
}

// 2. Lookup Asset by QR Hash OR Manual Tag
export async function lookupAssetAction(identifier: string) {
    const supabase = await createClient()

    // Strip the "RUDRA-ASSET:" prefix if the raw QR string is passed
    const cleanIdentifier = identifier.replace('RUDRA-ASSET:', '')

    const { data, error } = await supabase
        .from('client_assets')
        .select(`
            *,
            equipment_master (category, sub_category, make_model, maintenance_frequency_days),
            clients (name, address)
        `)
        .or(`qr_code_hash.eq.${cleanIdentifier},manual_asset_tag.ilike.${cleanIdentifier}`)
        .single()

    if (error || !data) {
        console.error('Lookup Error:', error);
        return { success: false, error: 'Asset not found or invalid QR/Tag' }
    }
    return { success: true, data }
}

// 3. Log Service & Update Condition
export async function logAssetService(serviceData: {
    asset_id: string;
    condition_reported: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Condemned';
    parts_replaced: string;
    action_taken: 'Serviced' | 'Repaired' | 'Refilled' | 'Replaced';
    next_due_date: string;
    serviced_by: string;
}) {
    const supabase = await createClient()

    // Step A: Insert the audit log
    const { error: logError } = await supabase
        .from('asset_service_history')
        .insert(serviceData)

    if (logError) return { success: false, error: logError.message }

    // Step B: Update the physical asset's current condition
    const { data: oldAsset } = await supabase.from('client_assets').select('*').eq('id', serviceData.asset_id).single()

    const { error: updateError } = await supabase
        .from('client_assets')
        .update({
            current_condition: serviceData.condition_reported,
            updated_at: new Date().toISOString()
        })
        .eq('id', serviceData.asset_id)

    if (updateError) return { success: false, error: 'Log saved, but failed to update asset condition: ' + updateError.message }

    // Log the automatic edit to the asset caused by the service
    if (oldAsset && oldAsset.current_condition !== serviceData.condition_reported) {
        const { data: newAsset } = await supabase.from('client_assets').select('*').eq('id', serviceData.asset_id).single()
        if (newAsset) await logEdit('client_assets', serviceData.asset_id, newAsset.manual_asset_tag || `Asset #${serviceData.asset_id}`, oldAsset, newAsset)
    }

    revalidatePath('/dashboard/assets');
    return { success: true, message: 'Service logged successfully.' }
}

// 4. Update Asset
export async function updateAssetAction(id: number, data: any) {
    const supabase = await createClient()

    const { data: oldAsset } = await supabase.from('client_assets').select('*').eq('id', id).single()

    const { error } = await supabase
        .from('client_assets')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating asset:', error)
        return { success: false, error: 'Failed to update asset' }
    }

    if (oldAsset) {
        const { data: newAsset } = await supabase.from('client_assets').select('*').eq('id', id).single()
        if (newAsset) {
            await logEdit('client_assets', id, newAsset.manual_asset_tag || `Asset #${id}`, oldAsset, newAsset)
        }
    }

    revalidatePath('/dashboard/assets')
    return { success: true }
}

// 5. Delete Asset
export async function deleteAssetAction(id: number) {
    const supabase = await createClient()

    const { data: record } = await supabase.from('client_assets').select('*').eq('id', id).single()

    const { error } = await supabase.from('client_assets').delete().eq('id', id)

    if (error) {
        console.error('Error deleting asset:', error)
        return { success: false, error: 'Failed to delete asset. Ensure there are no pending service history records tied to it.' }
    }

    if (record) {
        await logDeletion('client_assets', id, record.manual_asset_tag || `Asset #${id}`, record)
    }

    revalidatePath('/dashboard/assets')
    return { success: true }
}
