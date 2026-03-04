const url = process.argv[2] || "https://pcuszzwmdqaiwyytawfc.supabase.co/rest/v1/";
console.log(`Fetching ${url}...`);

fetch(url)
    .then(res => {
        console.log(`Status: ${res.status}`);
        return res.text();
    })
    .then(text => console.log(`Body length: ${text.length}`))
    .catch(err => {
        console.error(`Fetch failed: ${err.message}`);
        console.error(err);
    });
