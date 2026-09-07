import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { server: { proxy: { '/create-payment': {
    target: `http://127.0.0.1:${env.PORT || 3001}`,
    configure(proxy) {
      proxy.on('error', (_error, _req, res) => {
        if (res && !res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payment server unavailable. Restart npm run dev and check the server terminal.' }));
        }
      });
    },
  } } } };
});
