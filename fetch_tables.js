const URL = 'https://pcuszzwmdqaiwyytawfc.supabase.co';
const KEY = 'sb_publishable_1DjFD2nxZbj_KgrY6H2nGw_6H93kZjT';

async function run() {
  try {
    const res = await fetch(URL + '/rest/v1/', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    });
    const data = await res.json();
    console.log('Tables:', Object.keys(data.definitions || data.paths || data));
  } catch(e) {
    console.error(e);
  }
}
run();
