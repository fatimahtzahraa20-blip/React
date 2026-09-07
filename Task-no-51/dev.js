import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const children = [];
const apiConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project') && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('your-');
if (apiConfigured) children.push(spawn(process.execPath, ['--watch', 'src/server.js'], { stdio: 'inherit', env: process.env }));
else console.log('Browser-only mode: configure .env with Supabase credentials to enable cloud uploads.');
children.push(spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: process.env }));
for (const child of children) child.on('error', error => console.error(error.message));
function stop() { for (const child of children) child.kill(); }
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
process.on('exit', stop);
