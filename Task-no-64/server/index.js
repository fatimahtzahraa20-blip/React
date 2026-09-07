import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'tasks.json');

app.use(cors());
app.use(express.json());

async function readTasks() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function writeTasks(tasks) {
  await fs.writeFile(dataPath, JSON.stringify(tasks, null, 2));
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/tasks', async (_request, response) => {
  response.json(await readTasks());
});

app.post('/api/tasks', async (request, response) => {
  const tasks = await readTasks();
  const task = {
    id: `task-${Date.now()}`,
    title: request.body.title?.trim() || 'Untitled task',
    description: request.body.description?.trim() || '',
    status: request.body.status || 'backlog',
    priority: request.body.priority || 'medium',
    assignee: request.body.assignee || 'You',
    dueDate: request.body.dueDate || '',
    tags: Array.isArray(request.body.tags) ? request.body.tags : [],
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  await writeTasks(tasks);
  response.status(201).json(task);
});

app.patch('/api/tasks/:id', async (request, response) => {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === request.params.id);
  if (taskIndex === -1) return response.status(404).json({ error: 'Task not found' });
  tasks[taskIndex] = { ...tasks[taskIndex], ...request.body, updatedAt: new Date().toISOString() };
  await writeTasks(tasks);
  response.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', async (request, response) => {
  const tasks = await readTasks();
  const filteredTasks = tasks.filter((task) => task.id !== request.params.id);
  if (filteredTasks.length === tasks.length) return response.status(404).json({ error: 'Task not found' });
  await writeTasks(filteredTasks);
  response.status(204).end();
});

app.listen(port, () => console.log(`Taskboard API listening on http://localhost:${port}`));
