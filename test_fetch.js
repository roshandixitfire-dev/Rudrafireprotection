const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testFetch() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('leads').select('*').limit(5);

    if (error) {
        console.error('Fetch error:', error);
    } else {
        console.log('Successfully fetched:', data.length, 'leads');
        console.log('First lead:', data[0]);
    }
}

testFetch();
