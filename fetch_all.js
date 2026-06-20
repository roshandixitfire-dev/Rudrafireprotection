const URL = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const KEY = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

async function run() {
  try {
    const r1 = await fetch(URL + '/rest/v1/legacy_invoices?select=id,invoice_no,invoice_type,status,invoice_date,company_name', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('All Legacy Invoices:', await r1.json());

    const r2 = await fetch(URL + '/rest/v1/clients?select=id,name', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    const clients = await r2.json();
    console.log('All Clients count:', clients.length);
    console.log('Sample clients:', clients.slice(0, 5));
    
  } catch(e) {
    console.error(e);
  }
}

run();
