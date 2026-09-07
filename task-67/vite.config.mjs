import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api': {
      target: 'http://127.0.0.1:' + (env.PORT || '4077'),
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, ''),
    },
  };
  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { proxy },
  };
});
