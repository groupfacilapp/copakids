async function check() {
  const token = '77185354aac197a9382d4a04ea521a25b58b04dfc564437b22a4b7d2b8f89cf7';
  const url = `https://copakids-ashen.vercel.app/api/area/data/${token}`;

  try {
    const res = await fetch(url);
    console.log('Status Code:', res.status);
    const json = await res.json();
    console.log('API Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

check();
