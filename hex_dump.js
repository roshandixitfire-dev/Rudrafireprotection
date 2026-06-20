const fs = require('fs');
const content = fs.readFileSync('.env.local');
console.log(content.toString('hex'));
console.log(content.toString());
