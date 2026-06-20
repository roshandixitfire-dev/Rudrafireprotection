const supabaseUrl = 'https://pcuszzwmdqaiwyytawfc.supabase.co/auth/v1/token?grant_type=password';
const anonKey = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

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
