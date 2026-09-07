import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './panels.css'
import { supabaseConfigured } from './lib/supabase'

type Priority = 'low' | 'medium' | 'high'
type Task = { id: number; title: string; description: string; priority: Priority; due: string; assignee: string; listId: number; done?: boolean }
type List = { id: number; title: string; color: string }
type View = 'boards' | 'my-tasks'
type Panel = 'settings' | 'help' | 'notifications' | 'share' | null

const members = [
  { name: 'Maya Patel', initials: 'MP', color: '#e8b86d' },
  { name: 'Noah Williams', initials: 'NW', color: '#80b7a8' },
  { name: 'Alex Chen', initials: 'AC', color: '#a99ad8' },
  { name: 'Jamie Lee', initials: 'JL', color: '#df8f80' },
]

const initialLists: List[] = [
  { id: 1, title: 'Backlog', color: '#a7a8aa' },
  { id: 2, title: 'In progress', color: '#d5a34a' },
  { id: 3, title: 'Review', color: '#7d9db5' },
  { id: 4, title: 'Done', color: '#75a48f' },
]

const initialTasks: Task[] = [
  { id: 1, title: 'Finalize onboarding flow', description: 'Polish the first-run experience and empty states.', priority: 'high', due: 'Today', assignee: 'MP', listId: 2 },
  { id: 2, title: 'Audit mobile breakpoints', description: 'Check dashboard layouts at 390px and 768px.', priority: 'medium', due: 'Sep 12', assignee: 'AC', listId: 2 },
  { id: 3, title: 'Write API error states', description: 'Document responses for the most common failure paths.', priority: 'low', due: 'Sep 15', assignee: 'NW', listId: 1 },
  { id: 4, title: 'Component inventory', description: 'Map current patterns before the visual refresh.', priority: 'medium', due: 'Sep 11', assignee: 'JL', listId: 1 },
  { id: 5, title: 'Review analytics events', description: 'Confirm naming and payloads with the data team.', priority: 'high', due: 'Tomorrow', assignee: 'NW', listId: 3 },
  { id: 6, title: 'Set up release checklist', description: 'A small checklist for smoother weekly launches.', priority: 'low', due: 'Sep 18', assignee: 'MP', listId: 3 },
  { id: 7, title: 'Create design tokens', description: 'Centralize spacing, color, and typography decisions.', priority: 'medium', due: 'Sep 07', assignee: 'AC', listId: 4, done: true },
  { id: 8, title: 'QA keyboard navigation', description: 'Make sure every workflow works without a mouse.', priority: 'low', due: 'Sep 06', assignee: 'JL', listId: 4, done: true },
]

function App() {
  const [lists, setLists] = useState<List[]>(() => JSON.parse(localStorage.getItem('capstone-lists') ?? JSON.stringify(initialLists)))
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('capstone-tasks') ?? JSON.stringify(initialTasks)))
  const [activeBoard, setActiveBoard] = useState('Product launch')
  const [view, setView] = useState<View>('boards')
  const [panel, setPanel] = useState<Panel>(null)
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<'all' | Priority>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [doneOnly, setDoneOnly] = useState(false)
  const [menuListId, setMenuListId] = useState<number | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', listId: 1, priority: 'medium' as Priority })
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { localStorage.setItem('capstone-lists', JSON.stringify(lists)) }, [lists])
  useEffect(() => { localStorage.setItem('capstone-tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
  useEffect(() => {
    if ('clipboard' in navigator) return
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => {
        const fallback = document.createElement('textarea')
        fallback.value = value
        fallback.style.position = 'fixed'
        fallback.style.opacity = '0'
        document.body.appendChild(fallback)
        fallback.focus()
        fallback.select()
        document.execCommand('copy')
        fallback.remove()
      } },
    })
  }, [])

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase())
    const matchesView = view === 'boards' || task.assignee === 'MP'
    const matchesDone = !doneOnly || task.done
    return matchesQuery && matchesView && matchesDone && (priority === 'all' || task.priority === priority)
  }), [tasks, query, priority, view, doneOnly])

  const toggleTask = (id: number) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  const addTask = () => {
    if (!newTask.title.trim()) return
    setTasks((current) => [...current, { id: Date.now(), title: newTask.title.trim(), description: 'New task added to your workspace.', priority: newTask.priority, due: 'No date', assignee: 'MP', listId: newTask.listId }])
    setNewTask({ title: '', listId: 1, priority: 'medium' })
    setShowComposer(false)
  }
  const addList = () => setLists((current) => [...current, { id: Date.now(), title: 'New list', color: '#b68b75' }])
  const renameList = (listId: number) => { const name = window.prompt('Name this list', lists.find((list) => list.id === listId)?.title ?? 'New list'); if (name?.trim()) setLists((current) => current.map((list) => list.id === listId ? { ...list, title: name.trim() } : list)); setMenuListId(null) }
  const deleteList = (listId: number) => { if (window.confirm('Delete this list and its tasks?')) { setLists((current) => current.filter((list) => list.id !== listId)); setTasks((current) => current.filter((task) => task.listId !== listId)) }; setMenuListId(null) }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>capstone</span></div>
        <div className="workspace-switcher"><span className="workspace-dot">P</span><span><small>Workspace</small>Personal</span><span className="chevron">⌄</span></div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${view === 'boards' ? 'active' : ''}`} onClick={() => setView('boards')}><span>▦</span> Boards <b>⌘1</b></button><button className={`nav-item ${view === 'my-tasks' ? 'active' : ''}`} onClick={() => setView('my-tasks')}><span>◷</span> My tasks</button><button className="nav-item" onClick={() => searchRef.current?.focus()}><span>⌕</span> Search <b>⌘K</b></button>
        </nav>
        <div className="side-label">Your boards <button type="button" onClick={() => setActiveBoard('New board')}>+</button></div>
        <div className="board-list">{['Product launch', 'Website refresh', 'Personal goals'].map((board) => <button type="button" className={`board-link ${activeBoard === board ? 'selected' : ''}`} key={board} onClick={() => setActiveBoard(board)}><span className="board-icon">{board === 'Product launch' ? '◈' : board === 'Website refresh' ? '◇' : '○'}</span>{board}</button>)}</div>
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => setPanel('settings')}><span>⚙</span> Settings</button><div className="user-chip"><span className="avatar avatar-maya">MP</span><span><strong>Maya Patel</strong><small>{supabaseConfigured ? 'Synced account' : 'Local preview'}</small></span><button className="more" onClick={() => setPanel('settings')} aria-label="Open account settings">•••</button></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs"><span>{view === 'boards' ? 'Boards' : 'My tasks'}</span><i>/</i><strong>{activeBoard}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setPanel('notifications')}>♧</button><button className="icon-button" aria-label="Help" onClick={() => setPanel('help')}>?</button><span className="avatar avatar-maya">MP</span></div></header>
        <section className="board-head"><div><div className="eyebrow"><span className="board-icon">◈</span> CAPSTONE / {view === 'boards' ? 'PRODUCT LAUNCH' : 'ASSIGNED TO ME'}</div><h1>{view === 'boards' ? activeBoard : 'My tasks'}</h1><p>{view === 'boards' ? 'Plan, prioritize, and ship the next big thing.' : 'Everything assigned to you, across your workspace.'}</p></div><div className="head-actions"><div className="member-stack">{members.slice(0, 3).map((member) => <span className="avatar" style={{ background: member.color }} key={member.initials}>{member.initials}</span>)}<span className="avatar avatar-more">+2</span></div><button className="share-button" onClick={() => setPanel('share')}>↗ Share</button><button className="primary-button" onClick={() => setShowComposer(true)}>＋ Add task</button></div></section>
        <div className="toolbar"><div className="search-box"><span>⌕</span><input ref={searchRef} aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div><div className="filters"><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value as 'all' | Priority)}><option value="all">☷ All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select><div className="filter-wrap"><button className={`filter-button ${doneOnly ? 'active-filter' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>≡ Filter{doneOnly ? ' · 1' : ''}</button>{filterOpen && <div className="filter-popover"><label><input type="checkbox" checked={doneOnly} onChange={(event) => setDoneOnly(event.target.checked)} /> Completed only</label><button onClick={() => { setDoneOnly(false); setPriority('all'); setFilterOpen(false) }}>Clear filters</button></div>}</div><button className="view-button active">▦</button><button className="view-button" onClick={() => setView('my-tasks')}>☷</button></div></div>
        <div className="board-grid">{lists.map((list) => <section className="list-column" key={list.id}><div className="list-heading"><div><span className="status-dot" style={{ background: list.color }}></span><h2>{list.title}</h2><span className="task-count">{visibleTasks.filter((task) => task.listId === list.id).length}</span></div><div className="list-menu-wrap"><button aria-label={`More options for ${list.title}`} onClick={() => setMenuListId(menuListId === list.id ? null : list.id)}>•••</button>{menuListId === list.id && <div className="list-popover"><button onClick={() => renameList(list.id)}>Rename list</button><button onClick={() => deleteList(list.id)}>Delete list</button></div>}</div></div><div className="task-stack">{visibleTasks.filter((task) => task.listId === list.id).map((task) => <article className={`task-card ${task.done ? 'completed' : ''}`} key={task.id}><div className="task-top"><button className="check-button" aria-label={`Mark ${task.title} complete`} onClick={() => toggleTask(task.id)}>{task.done ? '✓' : ''}</button><span className={`priority ${task.priority}`}>{task.priority}</span><button className="card-more" aria-label="Task options">•••</button></div><h3>{task.title}</h3><p>{task.description}</p><div className="task-meta"><span className="due">◷ {task.due}</span><span className={`avatar avatar-${task.assignee.toLowerCase()}`}>{task.assignee}</span></div></article>)}<button className="add-inline" onClick={() => { setNewTask((current) => ({ ...current, listId: list.id })); setShowComposer(true) }}>＋ Add task</button></div></section>)}<button className="add-list" onClick={addList}><span>＋</span> Add list</button></div>
        <footer className="board-footer"><span><span className={`green-dot ${supabaseConfigured ? '' : 'offline-dot'}`}></span> {supabaseConfigured ? 'Supabase connected' : 'Local changes saved'}</span><span>{visibleTasks.length} visible tasks</span></footer>
      </main>
      {showComposer && <div className="modal-backdrop" onClick={() => setShowComposer(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">NEW TASK</span><h2>Add to your board</h2></div><button className="close-button" onClick={() => setShowComposer(false)}>×</button></div><label>Task name<input autoFocus value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="What needs to get done?" /></label><div className="modal-fields"><label>List<select value={newTask.listId} onChange={(event) => setNewTask({ ...newTask, listId: Number(event.target.value) })}>{lists.map((list) => <option value={list.id} key={list.id}>{list.title}</option>)}</select></label><label>Priority<select value={newTask.priority} onChange={(event) => setNewTask({ ...newTask, priority: event.target.value as Priority })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div><div className="modal-actions"><button className="share-button" onClick={() => setShowComposer(false)}>Cancel</button><button className="primary-button" onClick={addTask}>Create task</button></div></div></div>}
      {panel && <div className="modal-backdrop" onClick={() => setPanel(null)}><div className="modal side-panel" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">CAPSTONE</span><h2>{panel === 'settings' ? 'Workspace settings' : panel === 'help' ? 'Help center' : panel === 'notifications' ? 'Notifications' : 'Share board'}</h2></div><button className="close-button" onClick={() => setPanel(null)}>×</button></div>{panel === 'settings' && <div className="panel-content"><div className="setting-row"><span><strong>Data connection</strong><small>{supabaseConfigured ? 'Supabase is configured for this environment.' : 'Using local browser storage. Add credentials to connect.'}</small></span><span className={`connection-badge ${supabaseConfigured ? 'connected' : ''}`}>{supabaseConfigured ? 'Connected' : 'Local'}</span></div><div className="setting-row"><span><strong>Workspace</strong><small>Personal · 1 member</small></span><button className="text-button">Manage</button></div><div className="setting-row"><span><strong>Clear local data</strong><small>Reset this preview back to its starter tasks.</small></span><button className="text-button danger" onClick={() => { localStorage.removeItem('capstone-tasks'); localStorage.removeItem('capstone-lists'); window.location.reload() }}>Reset</button></div></div>}{panel === 'help' && <div className="panel-content help-content"><p>Capstone is a focused workspace for planning boards, lists, and tasks.</p><button className="help-link" onClick={() => setPanel('settings')}>Open workspace settings <span>→</span></button><button className="help-link" onClick={() => setPanel(null)}>Close help <span>×</span></button></div>}{panel === 'notifications' && <div className="panel-content"><div className="notification"><span className="notification-dot"></span><span><strong>All caught up</strong><small>No new activity on this board.</small></span></div></div>}{panel === 'share' && <div className="panel-content"><label>Board link<input readOnly value={`${window.location.origin}/boards/product-launch`} onFocus={(event) => event.currentTarget.select()} /></label><button className="primary-button copy-button" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/boards/product-launch`)}>Copy link</button><small className="modal-note">Anyone with the link can request access.</small></div>}</div></div>}
    </div>
  )
}

export default App
