import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/payments': 'http://127.0.0.1:4076', '/health': 'http://127.0.0.1:4076' } },
});
