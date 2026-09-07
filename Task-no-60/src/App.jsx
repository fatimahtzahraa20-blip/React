import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Circle, LogOut, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { supabase } from './main'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const initialForm = { title: '', description: '', priority: 'medium', project: 'Personal', due_date: '' }

async function api(path, options = {}, session) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...options.headers }
  })
  if (!response.ok) throw new Error((await response.json()).error || 'Something went wrong')
  return response.status === 204 ? null : response.json()
}

function Auth({ onAuthed }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    const result = mode === 'signin' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup') setMessage('Check your email to confirm your account.')
    else onAuthed(result.data.session)
    setBusy(false)
  }
  return <main className="auth-shell"><div className="auth-art"><div className="brand"><span className="brand-mark"><Check size={17} /></span> task<span>70</span></div><div className="art-copy"><p className="eyebrow">A clearer way to work</p><h1>Make room for the work that matters.</h1><p>Capture the loose ends, find your focus, and finish the day with a little more space.</p></div><div className="art-note"><Sparkles size={16} /> Built for thoughtful momentum</div></div><section className="auth-panel"><div className="mobile-brand brand"><span className="brand-mark"><Check size={17} /></span> task<span>70</span></div><p className="eyebrow">Your workspace</p><h2>{mode === 'signin' ? 'Welcome back.' : 'Start your workspace.'}</h2><p className="muted">{mode === 'signin' ? 'Sign in to pick up where you left off.' : 'Create an account and get organized in minutes.'}</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" minLength="6" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required /></label>{message && <p className="form-message">{message}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button></form><button className="text-button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></section></main>
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || initialForm)
  function update(key, value) { setForm(current => ({ ...current, [key]: value })) }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal"><div className="modal-heading"><div><p className="eyebrow">{task ? 'Edit task' : 'New task'}</p><h2>{task ? 'Refine the details.' : 'What needs doing?'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><label>Title<input autoFocus value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Prepare the project brief" /></label><label>Notes<textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Add context, links, or a definition of done" rows="4" /></label><div className="form-grid"><label>Priority<select value={form.priority} onChange={e => update('priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Project<input value={form.project} onChange={e => update('project', e.target.value)} /></label></div><label>Due date<input type="date" value={form.due_date || ''} onChange={e => update('due_date', e.target.value)} /></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={() => onSave(form)} disabled={!form.title.trim()}>{task ? 'Save changes' : 'Add task'}</button></div></section></div>
}

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) }); const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => listener.subscription.unsubscribe() }, [])
  useEffect(() => { if (session) api('/api/tasks', {}, session).then(setTasks).catch(e => setError(e.message)) }, [session])
  const visible = useMemo(() => tasks.filter(task => (filter === 'all' || task.status === filter) && `${task.title} ${task.description} ${task.project}`.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query])
  const counts = { all: tasks.length, todo: tasks.filter(t => t.status === 'todo').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, done: tasks.filter(t => t.status === 'done').length }
  async function saveTask(form) { try { const saved = modal?.id ? await api(`/api/tasks/${modal.id}`, { method: 'PATCH', body: JSON.stringify(form) }, session) : await api('/api/tasks', { method: 'POST', body: JSON.stringify(form) }, session); setTasks(current => modal?.id ? current.map(t => t.id === saved.id ? saved : t) : [saved, ...current]); setModal(null) } catch (e) { setError(e.message) } }
  async function toggleTask(task) { const status = task.status === 'done' ? 'todo' : 'done'; const saved = await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, session); setTasks(current => current.map(t => t.id === saved.id ? saved : t)) }
  async function deleteTask(task) { if (!window.confirm('Delete this task?')) return; await api(`/api/tasks/${task.id}`, { method: 'DELETE' }, session); setTasks(current => current.filter(t => t.id !== task.id)) }
  if (loading) return <div className="loading-screen"><span className="brand-mark"><Check size={17} /></span> Loading your workspace...</div>
  if (!session) return <Auth onAuthed={setSession} />
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Check size={17} /></span> task<span>70</span></div><div className="sidebar-intro"><p className="eyebrow">Good morning</p><h1>Let's make today count.</h1></div><nav><button className={filter === 'all' ? 'nav-item active' : 'nav-item'} onClick={() => setFilter('all')}><span className="nav-icon"><Circle size={15} /></span> All tasks <b>{counts.all}</b></button><button className={filter === 'todo' ? 'nav-item active' : 'nav-item'} onClick={() => setFilter('todo')}><span className="nav-icon"><Circle size={15} /></span> To do <b>{counts.todo}</b></button><button className={filter === 'in_progress' ? 'nav-item active' : 'nav-item'} onClick={() => setFilter('in_progress')}><span className="nav-icon progress-icon"><Circle size={15} /></span> In progress <b>{counts.in_progress}</b></button><button className={filter === 'done' ? 'nav-item active' : 'nav-item'} onClick={() => setFilter('done')}><span className="nav-icon"><Check size={15} /></span> Completed <b>{counts.done}</b></button></nav><div className="sidebar-footer"><div className="avatar">{session.user.email?.[0].toUpperCase()}</div><div className="user-email">{session.user.email}</div><button className="icon-button" onClick={() => supabase.auth.signOut()} aria-label="Sign out"><LogOut size={17} /></button></div></aside><main className="content"><header className="content-header"><div><p className="eyebrow">Monday, September 7, 2026</p><h2>{filter === 'all' ? 'Your focus board' : filter === 'in_progress' ? 'In progress' : filter === 'done' ? 'Completed' : 'To do'}</h2></div><button className="primary-button add-button" onClick={() => setModal('new')}><Plus size={18} /> New task</button></header><section className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your tasks" /></div><button className="filter-button">{visible.length} tasks <ChevronDown size={15} /></button></section>{error && <div className="error-banner">{error}<button onClick={() => setError('')}><X size={15} /></button></div>}<section className="task-list">{visible.length === 0 ? <div className="empty-state"><div className="empty-mark"><Check size={24} /></div><h3>{query ? 'Nothing matches that search.' : 'A clear desk is a good start.'}</h3><p>{query ? 'Try a different word or project.' : 'Add your first task and turn intention into momentum.'}</p>{!query && <button className="secondary-button" onClick={() => setModal('new')}><Plus size={16} /> Add your first task</button>}</div> : visible.map(task => <article className={`task-row ${task.status === 'done' ? 'is-done' : ''}`} key={task.id}><button className={`check-button ${task.status === 'done' ? 'checked' : ''}`} onClick={() => toggleTask(task)} aria-label={`Mark ${task.title} ${task.status === 'done' ? 'not done' : 'done'}`}><Check size={15} /></button><div className="task-body" onClick={() => setModal(task)}><div className="task-title-line"><h3>{task.title}</h3><span className={`priority ${task.priority}`}>{task.priority}</span></div><p>{task.description || 'No notes added'}</p><div className="task-meta"><span>{task.project}</span>{task.due_date && <span>Due {new Date(`${task.due_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}</div></div><button className="delete-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button></article>)}</section></main>{modal && <TaskModal task={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={saveTask} />}</div>
}

export default App
