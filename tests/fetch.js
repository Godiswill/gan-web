(async () => {
  try {
    const undici = require('undici');
    console.log(
      'undici.setGlobalDispatcher?',
      typeof undici.setGlobalDispatcher === 'function'
    );

    undici.setGlobalDispatcher(new undici.ProxyAgent('http://127.0.0.1:10808'));

    const res = await fetch(
      'https://accounts.google.com/.well-known/openid-configuration'
    );
    console.log('status', res.status);
    const body = await res.text();
    console.log(body.slice(0, 200));
  } catch (err) {
    console.error('fetch error:', err);
  }
})();
