const supabaseUrl = 'https://pcuszzwmdqaiwyytawfc.supabase.co/auth/v1/token?grant_type=password';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdXN6endtZHFhaXd5eXRhd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDI5NjMsImV4cCI6MjA4NjM3ODk2M30.5FOkaephYnd63x6oZY6VjDGIUEaDzJq3-Z_VyNl1Kmg';

fetch(supabaseUrl, {
    method: 'POST',
    headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'roshandixitfire@gmail.com',
        password: 'wrong-password'
    })
})
    .then(res => {
        console.log('Status:', res.status);
        return res.json();
    })
    .then(json => console.log('Response:', json))
    .catch(err => console.error('Error:', err));
