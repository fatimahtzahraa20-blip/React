require('dotenv').config();
const { connectDB } = require('./db');
const app = require('./app');
const PORT = process.env.PORT || 4076;
connectDB()
  .then(() => app.listen(PORT, () => console.log('[task-76] listening on :' + PORT)))
  .catch(err => { console.error('[task-76] startup failed:', err.message); process.exit(1); });
