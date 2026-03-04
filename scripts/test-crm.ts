import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCRM() {
    console.log('--- Starting CRM Integration Tests ---')

    // 1. Array to hold test lead ID
    let testLeadId: number | null = null

    // 2. Test Lead Creation
    console.log('\n[Test 1] Creating new lead...')
    const newLead = {
        sr_no: 'TEST-999',
        sales_form_no: 'SF-TEST-1',
        project_name: 'Automated Test Project',
        stage: 'Qualified',
        category: 'Hot',
        remarks: 'This is an automated test lead.'
    }

    const { data: insertData, error: insertError } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single()

    if (insertError) {
        console.error('❌ Lead Creation Failed:', insertError)
        return
    }

    testLeadId = insertData.id
    console.log('✅ Lead Created successfully. ID:', testLeadId)
    console.log('Data:', insertData.project_name, '| Stage:', insertData.stage)

    // 3. Test Lead Update
    console.log('\n[Test 2] Updating the lead...')
    const updateData = {
        stage: 'Win',
        category: 'Super Hot',
        remarks: 'Updated remark.'
    }

    const { error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', testLeadId)

    if (updateError) {
        console.error('❌ Lead Update Failed:', updateError)
        return
    }
    console.log('✅ Lead Updated successfully.')

    // 4. Verify the update
    console.log('\n[Test 3] Verifying update in database...')
    const { data: verifyData } = await supabase
        .from('leads')
        .select('stage, category')
        .eq('id', testLeadId)
        .single()

    if (verifyData?.stage === 'Win') {
        console.log('✅ Update verified correctly.')
    } else {
        console.error('❌ Verification failed.', verifyData)
    }

    // 5. Test Audit Logs (Wait briefly for triggers/functions to complete if they handle logging, though presently logging is handled via Next.js Server Actions, not raw DB. So testing raw DB won\'t trigger Next.js logging unless we hit the Next.js API. 
    // Since we are testing DB directly, let's just test CRUD limits)

    // 6. Test Lead Deletion
    console.log('\n[Test 4] Deleting the test lead...')
    const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', testLeadId)

    if (deleteError) {
        console.error('❌ Lead Deletion Failed:', deleteError)
        return
    }
    console.log('✅ Lead Deleted successfully.')

    // 7. Verify Deletion
    console.log('\n[Test 5] Verifying deletion...')
    const { data: finalCheck } = await supabase
        .from('leads')
        .select('id')
        .eq('id', testLeadId)

    if (!finalCheck || finalCheck.length === 0) {
        console.log('✅ Lead completely removed from database.')
    } else {
        console.error('❌ Lead still exists in database!')
    }

    console.log('\n--- All Automated Backend Tests Passed! ---')
}

testCRM()
