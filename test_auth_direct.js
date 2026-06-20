const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdXN6endtZHFhaXd5eXRhd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDI5NjMsImV4cCI6MjA4NjM3ODk2M30.5FOkaephYnd63x6oZY6VjDGIUEaDzJq3-Z_VyNl1Kmg';

async function testAuth() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Testing login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'roshandixitfire@gmail.com',
        password: 'wrong-password-on-purpose'
    });

    if (error) {
        console.log('Error Message:', error.message);
        console.log('Error Status:', error.status);
    } else {
        console.log('Success (Wait, how?)');
    }
}

testAuth();
