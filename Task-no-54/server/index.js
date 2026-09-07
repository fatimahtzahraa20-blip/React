import { createApp } from './app.js';
const app = createApp({ production: process.env.NODE_ENV === 'production', secret: process.env.JWT_SECRET });
app.listen(3001, '127.0.0.1', () => console.log('Gatekeeper: http://127.0.0.1:3001'));
