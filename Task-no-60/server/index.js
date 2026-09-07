import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const port = process.env.PORT || 3000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: clientUrl, credentials: true }))
app.use(express.json())

function getUserClient(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}

async function requireUser(req, res, next) {
  const supabase = getUserClient(req)
  if (!supabase) return res.status(401).json({ error: 'Authentication required' })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return res.status(401).json({ error: 'Invalid session' })
  req.user = user
  req.supabase = supabase
  next()
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'task-70-api' }))

app.get('/api/tasks', requireUser, async (req, res) => {
  const { data, error } = await req.supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

app.post('/api/tasks', requireUser, async (req, res) => {
  const { title, description = '', priority = 'medium', due_date = null, project = 'Personal' } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })
  const { data, error } = await req.supabase.from('tasks').insert({
    user_id: req.user.id, title: title.trim(), description, priority, due_date, project
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.patch('/api/tasks/:id', requireUser, async (req, res) => {
  const allowed = ['title', 'description', 'priority', 'due_date', 'project', 'status']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const { data, error } = await req.supabase.from('tasks').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

app.delete('/api/tasks/:id', requireUser, async (req, res) => {
  const { error } = await req.supabase.from('tasks').delete().eq('id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).end()
})

app.listen(port, () => console.log(`Task 70 API listening on port ${port}`))
