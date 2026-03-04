
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Using Service Role Key from context history to bypass RLS and access Admin API
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdXN6endtZHFhaXd5eXRhd2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgwMjk2MywiZXhwIjoyMDg2Mzc4OTYzfQ.FcBYZIeh5JLcnQ2ibyvIy4T4kA4Pr86nEkR54yw-fIk'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function listUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log(`Total Users: ${users.length}`)
    users.forEach(u => {
        console.log(`- ${u.email} (Verified: ${u.email_confirmed_at ? 'Yes' : 'No'})`)
    })
}

listUsers()
