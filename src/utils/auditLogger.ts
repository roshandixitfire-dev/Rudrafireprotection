import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { DEMO_COOKIE_NAME } from './supabase/demo-users'

/**
 * Enhanced timeout helper for fetch requests
 */
export const withTimeout = (promise: Promise<any>, ms: number = 5000) => {
    let timeoutId: ReturnType<typeof setTimeout>
    const timeoutPromise = new Promise((_, reject) =>
        timeoutId = setTimeout(() => reject(new Error('Network connection timed out')), ms)
    )
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
}

/**
 * Retrieves the current logged in user's email based on demo cookies or Supabase auth
 */
export async function getAuditUserEmail(): Promise<string> {
    try {
        const cookieStore = await cookies()
        const demoUserCookie = cookieStore.get(DEMO_COOKIE_NAME)
        if (demoUserCookie) {
            const demoUser = JSON.parse(demoUserCookie.value)
            if (demoUser?.email) return demoUser.email
        }
    } catch {
        // Fallback to supabase auth if not a demo user
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await withTimeout(supabase.auth.getUser() as unknown as Promise<any>, 3000)
        return user?.email || 'System'
    } catch {
        return 'System'
    }
}

/**
 * Logs a generalized edit event
 */
export async function logEdit(
    tableName: string,
    recordId: string | number,
    displayName: string,
    oldData: any,
    newData: any
) {
    try {
        const supabase = await createClient()
        const userEmail = await getAuditUserEmail()

        // We only want to log fields that actually changed
        const changedOldData: any = {}
        const changedNewData: any = {}
        let hasChanges = false

        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                changedOldData[key] = oldData[key]
                changedNewData[key] = newData[key]
                hasChanges = true
            }
        }

        // Don't log if there are no semantic changes
        if (!hasChanges) return

        await withTimeout(
            supabase.from('edit_logs').insert({
                table_name: tableName,
                record_id: recordId.toString(),
                display_name: displayName,
                old_data: changedOldData,
                new_data: changedNewData,
                edited_by: userEmail
            }) as unknown as Promise<any>
        )
    } catch (e) {
        console.error('Failed to log edit:', e)
    }
}

/**
 * Logs a generalized deletion event
 */
export async function logDeletion(
    tableName: string,
    recordId: string | number,
    displayName: string,
    fullData: any
) {
    try {
        const supabase = await createClient()
        const userEmail = await getAuditUserEmail()

        await withTimeout(
            supabase.from('deletion_logs').insert({
                table_name: tableName,
                record_id: recordId.toString(),
                display_name: displayName,
                data: fullData,
                deleted_by: userEmail
            }) as unknown as Promise<any>
        )
    } catch (e) {
        console.error('Failed to log deletion:', e)
    }
}
