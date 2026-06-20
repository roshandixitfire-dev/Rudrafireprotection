const URL = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const KEY = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

async function run() {
  try {
    const r1 = await fetch(URL + '/rest/v1/clients?select=id,name&name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Clients:', await r1.json());

    const r2 = await fetch(URL + '/rest/v1/legacy_invoices?select=id,invoice_no,invoice_type,status,invoice_date,company_name&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Legacy Invoices:', await r2.json());

    const r3 = await fetch(URL + '/rest/v1/amc_invoices?select=id,invoice_number,invoice_type,invoice_date,company_name&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('AMC Invoices:', await r3.json());
    
    // Also check quotations
    const r4 = await fetch(URL + '/rest/v1/legacy_quotes?select=id,quote_no,date,company_name&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Quotations:', await r4.json());

  } catch(e) {
    console.error(e);
  }
}

run();
