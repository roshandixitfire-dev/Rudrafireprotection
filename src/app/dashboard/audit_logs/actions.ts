'use server'

import { createClient } from '@/utils/supabase/server'
import { withTimeout } from '@/utils/auditLogger'

export async function getAuditLogsAction(tableName: string) {
    try {
        const supabase = await createClient()

        // Fetch edit logs for this module
        const { data: editsData, error: editsError } = await withTimeout(
            supabase
                .from('edit_logs')
                .select('*')
                .eq('table_name', tableName)
                .order('edited_at', { ascending: false })
                .limit(100) as unknown as Promise<any>
        )

        // Fetch deletion logs for this module
        const { data: deletionsData, error: deletionsError } = await withTimeout(
            supabase
                .from('deletion_logs')
                .select('*')
                .eq('table_name', tableName)
                .order('deleted_at', { ascending: false })
                .limit(100) as unknown as Promise<any>
        )

        if (editsError) throw editsError
        if (deletionsError) throw deletionsError

        return {
            success: true,
            edits: editsData || [],
            deletions: deletionsData || []
        }
    } catch (e: any) {
        console.error(`Failed to fetch audit logs for ${tableName}:`, e)
        return {
            success: false,
            error: e.message || 'Network or Database Error'
        }
    }
}

export async function restoreDeletedRecordAction(tableName: string, logId: number) {
    try {
        const supabase = await createClient()

        // 1. Fetch the log
        const { data: log, error: logError } = await withTimeout(
            supabase.from('deletion_logs').select('*').eq('id', logId).single() as unknown as Promise<any>
        )

        if (logError || !log) throw logError || new Error('Log not found')

        // Safety check to ensure the UI didn't submit a wrong table name
        if (log.table_name !== tableName) {
            throw new Error('Table name mismatch on restoration')
        }

        const originalData = log.data

        // 2. Insert back into the target table
        const { error: insertError } = await withTimeout(
            supabase.from(tableName).insert(originalData) as unknown as Promise<any>
        )
        if (insertError) throw insertError

        // 3. Delete the log so it doesn't clutter
        const { error: deleteError } = await withTimeout(
            supabase.from('deletion_logs').delete().eq('id', logId) as unknown as Promise<any>
        )
        if (deleteError) console.error('Failed to cleanup deletion log after restore:', deleteError)

        return { success: true }
    } catch (e: any) {
        console.error(`Failed to restore ${tableName} record:`, e)
        return { success: false, error: e.message || 'Restoration failed' }
    }
}
