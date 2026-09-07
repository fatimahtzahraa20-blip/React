import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = `http://127.0.0.1:${process.env.PORT || env.PORT || '3000'}`;
  const proxy = {
    '/api': {
      target,
      configure(server) {
        server.on('error', (_error, _request, response) => {
          if (response && typeof response.writeHead === 'function' && !response.headersSent) {
            response.writeHead(503, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Express is not running. Run npm run dev:api in a second terminal, or restart with npm run dev to launch both React and Express.' }));
          }
        });
      },
    },
  };
  return { server: { proxy }, preview: { proxy } };
});
