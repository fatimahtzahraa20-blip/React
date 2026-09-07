import express from 'express';

const app = express();

app.use((_request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'task-71-api' });
});

export default app;
