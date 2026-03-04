const https = require('https');

const token = 'sbp_e8f61e93b25e7ad4bedeb3cd70531c01f6e3b935';

const options = {
  hostname: 'api.supabase.com',
  path: '/v1/projects',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Antigravity-Agent'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const projects = JSON.parse(data);
        console.log('Successfully retrieved projects:');
        projects.forEach(p => {
            console.log(`- Project: ${p.name} (ID: ${p.id}, Ref: ${p.ref})`);
            // We also need the API keys, which might be in a separate endpoint or included
            // Actually, /v1/projects returns basic info. Keys are at /projects/{ref}/api-keys
        });
        
        if (projects.length > 0) {
             console.log('\nFetching keys for the first project...');
             getProjectKeys(projects[0].ref);
        } else {
            console.log('No projects found.');
        }

      } catch (e) {
        console.error('Error parsing response:', e);
      }
    } else {
      console.error(`Status Code: ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

function getProjectKeys(ref) {
    const keyOptions = {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${ref}/api-keys`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Antigravity-Agent'
        }
    };

    const keyReq = https.request(keyOptions, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const keys = JSON.parse(data);
                console.log(`\nKeys for project ${ref}:`);
                console.log(JSON.stringify(keys, null, 2));
            } else {
                 console.log('Failed to get keys:', data);
            }
        });
    });
    keyReq.end();
}
