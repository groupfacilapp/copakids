async function check() {
  const token = '77185354aac197a9382d4a04ea521a25b58b04dfc564437b22a4b7d2b8f89cf7';
  const url = `https://copakids-ashen.vercel.app/area/${token}`;

  try {
    const res = await fetch(url);
    console.log('Status Code:', res.status);
    const text = await res.text();
    console.log('HTML Length:', text.length);
    console.log('HTML snippet:', text.slice(0, 500));
  } catch (err) {
    console.error('Error fetching page:', err);
  }
}

check();
