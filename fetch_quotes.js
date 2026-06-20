const URL = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const KEY = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

async function run() {
  try {
    const r1 = await fetch(URL + '/rest/v1/quotations?select=id,quote_no,date,company_name&company_name=ilike.*silver*', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    console.log('Quotations for Silver Beach:', await r1.json());
  } catch(e) {
    console.error(e);
  }
}

run();
