'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createActivityAction(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        client_id: formData.get('clientId'),
        activity_type: formData.get('activityType'),
        activity_date: formData.get('activityDate'),
        activity_time: formData.get('activityTime'),
        remarks: formData.get('remarks'),
        next_reminder_date: formData.get('nextReminderDate') ? formData.get('nextReminderDate') as string : null,
        reminder_type: formData.get('reminderType') as string,
        reminder_status: formData.get('nextReminderDate') ? 'Pending' : null,
    }

    const { error } = await supabase.from('client_activities').insert(rawData)

    if (error) {
        console.error('Error creating activity:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/activities')
    return { success: true }
}
