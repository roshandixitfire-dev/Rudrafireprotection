const URL = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const KEY = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

async function run() {
  try {
    const r2 = await fetch(URL + '/rest/v1/invoices?select=*&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Invoices:', await r2.json());

    const r3 = await fetch(URL + '/rest/v1/quotations?select=*&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Quotations:', await r3.json());
  } catch(e) {
    console.error(e);
  }
}

run();
