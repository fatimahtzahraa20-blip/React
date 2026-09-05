import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  if (process.env.VERCEL === '1') {
    for (const name of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
      if (!env[name] || env[name].includes('YOUR_')) {
        throw new Error(`Missing ${name}. Add it in Vercel Project Settings > Environment Variables and redeploy.`);
      }
    }
  }
  return { plugins: [react()] };
});
