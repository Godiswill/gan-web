// fix: [auth][error] TypeError: fetch failed
// 终端环境没有走代理，直接裸连 Google，被防火墙拦了
// 1. pnpm add -D undici
// 2. package.json:
//  "scripts": {
//      "dev": "NODE_OPTIONS='--require ./scripts/setup-proxy.js' next dev --turbopack",
//
const PROXY =
  process.env.HTTP_PROXY || process.env.http_proxy || 'http://127.0.0.1:10808';

try {
  const undici = require('undici');
  if (typeof undici.setGlobalDispatcher === 'function') {
    const { ProxyAgent, setGlobalDispatcher } = undici;
    setGlobalDispatcher(new ProxyAgent(PROXY));
    console.log('[setup-proxy] undici ProxyAgent set to', PROXY);
  } else {
    console.warn('[setup-proxy] undici.setGlobalDispatcher not found');
  }
} catch (err) {
  console.warn('[setup-proxy] undici setup failed:', err.message);
}
