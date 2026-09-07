import { useMemo, useState } from 'react'
import './App.css'

type Status = 'In progress' | 'In review' | 'Backlog' | 'Done'
type Priority = 'High' | 'Medium' | 'Low'
type Task = { id: number; title: string; project: string; status: Status; priority: Priority; due: string; assignee: string; color: string }
type Panel = 'help' | 'settings' | 'account' | 'workspace' | 'project' | null

const initialTasks: Task[] = [
  { id: 1, title: 'Finalize onboarding flow', project: 'Website refresh', status: 'In progress', priority: 'High', due: 'Today', assignee: 'AM', color: '#ff8a65' },
  { id: 2, title: 'Audit workspace permissions', project: 'Internal tools', status: 'In review', priority: 'Medium', due: 'Tomorrow', assignee: 'JL', color: '#89a5ff' },
  { id: 3, title: 'Create empty states', project: 'Mobile app', status: 'Backlog', priority: 'Low', due: 'Sep 12', assignee: 'SK', color: '#b5d66b' },
  { id: 4, title: 'Add billing portal events', project: 'Growth engine', status: 'Done', priority: 'Medium', due: 'Sep 08', assignee: 'AM', color: '#e6a85c' },
]
const initialProjects = [{ name: 'Website refresh', color: '#ff8a65' }, { name: 'Internal tools', color: '#89a5ff' }, { name: 'Mobile app', color: '#b5d66b' }]
const activitySeed = [
  { initials: 'JL', color: '#89a5ff', text: 'Jordan moved Audit workspace permissions to In review', time: '8 min' },
  { initials: 'AM', color: '#ff8a65', text: 'You added a file to Finalize onboarding flow', time: '24 min' },
  { initials: 'SK', color: '#b5d66b', text: 'Sana completed Create empty states', time: '1 hr' },
]

function Avatar({ initials, color }: { initials: string; color: string }) { return <span className="avatar" style={{ background: color }}>{initials}</span> }

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [projects, setProjects] = useState(initialProjects)
  const [activity, setActivity] = useState(activitySeed)
  const [activeView, setActiveView] = useState('My work')
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All')
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All')
  const [showFilter, setShowFilter] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [newTask, setNewTask] = useState('')
  const [newProject, setNewProject] = useState('')
  const [selectedFile, setSelectedFile] = useState('')

  const pageTitle = activeView.startsWith('project:') ? activeView.replace('project:', '') : activeView
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.project}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority
    const matchesView = activeView === 'My work' ? task.assignee === 'AM' : activeView === 'All tasks' ? true : activeView === 'In review' ? task.status === 'In review' : activeView === 'Completed' ? task.status === 'Done' : task.project === pageTitle
    return matchesQuery && matchesStatus && matchesPriority && matchesView
  }), [activeView, filterPriority, filterStatus, pageTitle, query, tasks])

  function addTask() {
    if (!newTask.trim()) return
    const task: Task = { id: Date.now(), title: newTask.trim(), project: 'Website refresh', status: 'Backlog', priority: 'Medium', due: 'Sep 14', assignee: 'AM', color: '#ff8a65' }
    setTasks((current) => [task, ...current])
    setActivity((current) => [{ initials: 'AM', color: '#ff8a65', text: `You created ${task.title}`, time: 'now' }, ...current])
    setNewTask('')
    setShowComposer(false)
  }
  function addProject() {
    const name = newProject.trim()
    if (!name) return
    setProjects((current) => [...current, { name, color: '#c28eb2' }])
    setNewProject('')
    setPanel(null)
    setActiveView(`project:${name}`)
  }
  function attachFile() {
    if (!selectedFile) return
    setActivity((current) => [{ initials: 'AM', color: '#ff8a65', text: `You attached ${selectedFile} to Finalize onboarding flow`, time: 'now' }, ...current])
    setSelectedFile('')
  }
  function resetFilters() { setFilterStatus('All'); setFilterPriority('All'); setQuery('') }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => { setActiveView('My work'); setPanel(null) }}><span className="brand-mark">SB</span><span>SaaS Board</span><span className="workspace-pill">ACME</span></button>
      <button className="new-task" onClick={() => setShowComposer(true)}><span>+</span> New task <kbd>N</kbd></button>
      <nav className="primary-nav">{['My work', 'All tasks', 'In review', 'Completed'].map((item) => <button key={item} className={activeView === item ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView(item); setPanel(null) }}><span className="nav-icon">{item === 'My work' ? '⌂' : item === 'All tasks' ? '▤' : item === 'In review' ? '◷' : '✓'}</span>{item}<span className="nav-count">{item === 'My work' ? '2' : item === 'In review' ? '1' : ''}</span></button>)}</nav>
      <div className="side-section"><p className="eyebrow">Projects <button aria-label="Add project" onClick={() => setPanel('project')}>+</button></p>{projects.map((project) => <button className={activeView === `project:${project.name}` ? 'project-link selected-project' : 'project-link'} key={project.name} onClick={() => { setActiveView(`project:${project.name}`); setPanel(null) }}><i className="dot" style={{ background: project.color }} />{project.name}<span>{tasks.filter((task) => task.project === project.name).length}</span></button>)}</div>
      <div className="side-bottom"><button className="nav-item" onClick={() => setPanel('help')}><span className="nav-icon">?</span>Help center</button><button className="nav-item" onClick={() => setPanel('settings')}><span className="nav-icon">⚙</span>Settings</button><button className="user-card" onClick={() => setPanel('account')}><Avatar initials="AM" color="#ff8a65" /><span><strong>Alex Morgan</strong><small>Admin</small></span><span className="chevron">⌄</span></button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{pageTitle}</strong></div><div className="top-actions"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /><kbd>⌘ K</kbd></label><button className="icon-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">♢<span className="notification-dot" /></button><button className="icon-button" onClick={() => setPanel('help')} aria-label="Help">?</button><button className="top-avatar" onClick={() => setPanel('account')} aria-label="Open account"><Avatar initials="AM" color="#ff8a65" /></button></div></header>
      {showNotifications && <div className="notification-popover"><strong>Notifications</strong><p>Jordan updated a task 8 minutes ago.</p><p>Your attachment finished uploading.</p></div>}
      <div className="content-wrap"><section className="page-heading"><div><p className="eyebrow accent-label">Tuesday, September 8, 2026</p><h1>{pageTitle}</h1><p className="subtitle">A clear view of what needs your attention.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => setShowFilter(!showFilter)}>☷ Filter <span>{(filterStatus !== 'All' ? 1 : 0) + (filterPriority !== 'All' ? 1 : 0)}</span></button><button className="primary-button" onClick={() => setShowComposer(true)}>+ New task</button></div></section>
        {showFilter && <div className="filter-popover"><label>Status<select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as Status | 'All')}><option>All</option><option>Backlog</option><option>In progress</option><option>In review</option><option>Done</option></select></label><label>Priority<select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value as Priority | 'All')}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label><button onClick={resetFilters}>Clear filters</button></div>}
        <section className="stats"><div><span className="stat-icon coral-bg">◷</span><span><small>Due today</small><strong>2 tasks</strong></span></div><div><span className="stat-icon blue-bg">↗</span><span><small>In progress</small><strong>4 tasks</strong></span></div><div><span className="stat-icon green-bg">✓</span><span><small>Completed this week</small><strong>18 tasks</strong></span></div><div className="progress-stat"><div><small>Weekly momentum</small><strong>74%</strong></div><div className="progress"><i /></div></div></section>
        <section className="workspace-grid"><div className="task-panel"><div className="panel-header"><div><h2>Tasks</h2><span className="muted">{visibleTasks.length} showing</span></div><div className="view-toggle"><button className="selected">☷</button><button>▦</button></div></div><div className="task-table"><div className="table-head"><span>Task</span><span>Status</span><span>Priority</span><span>Due date</span><span>Assignee</span></div>{visibleTasks.map((task) => <div className="task-row" key={task.id}><div className="task-name"><button className={`check ${task.status === 'Done' ? 'checked' : ''}`} onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: item.status === 'Done' ? 'Backlog' : 'Done' } : item))}>{task.status === 'Done' ? '✓' : ''}</button><span><strong>{task.title}</strong><small><i className="dot" style={{ background: task.color }} />{task.project}</small></span></div><span className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span><span className={task.due === 'Today' ? 'due today' : 'due'}>{task.due}</span><Avatar initials={task.assignee} color="#ff8a65" /></div>)}</div><button className="load-more">Load more tasks <span>↓</span></button></div>
          <aside className="activity-panel"><div className="panel-header"><div><h2>Live activity</h2><span className="live"><i /> Realtime</span></div><button className="more-button">•••</button></div><div className="activity-list">{activity.slice(0, 5).map((item, index) => <div className="activity-item" key={`${item.text}-${index}`}><Avatar initials={item.initials} color={item.color} /><div><p>{item.text}</p><small>{item.time} ago</small></div></div>)}</div><div className="activity-composer"><Avatar initials="AM" color="#ff8a65" /><input placeholder="Share an update..." onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value) { setActivity((current) => [{ initials: 'AM', color: '#ff8a65', text: event.currentTarget.value, time: 'now' }, ...current]); event.currentTarget.value = '' } }} /><span>↵</span></div></aside></section>
        <section className="attachment-banner"><div className="attachment-art">↗</div><div><strong>Keep your work together</strong><p>Attach briefs, designs, and notes directly to tasks so context never gets lost.</p></div><label className="upload-button">{selectedFile || '＋ Attach a file'}<input type="file" onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? '')} /></label>{selectedFile && <button className="attach-confirm" onClick={attachFile}>Add file</button>}</section>
      </div>
    </main>
    {showComposer && <div className="modal-backdrop" onClick={() => setShowComposer(false)}><div className="composer-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow accent-label">New task</p><h2>What needs doing?</h2></div><button className="close-button" onClick={() => setShowComposer(false)}>×</button></div><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="e.g. Prepare launch checklist" /><div className="modal-meta"><span>Website refresh</span><span>Medium priority</span><span>Due Sep 14</span></div><div className="modal-footer"><button className="secondary-button" onClick={() => setShowComposer(false)}>Cancel</button><button className="primary-button" onClick={addTask}>Create task</button></div></div></div>}
    {panel && <div className="modal-backdrop" onClick={() => setPanel(null)}><div className="composer-modal side-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow accent-label">SaaS Board</p><h2>{panel === 'project' ? 'Add project' : panel === 'help' ? 'Help center' : panel === 'settings' ? 'Workspace settings' : panel === 'workspace' ? 'Workspace' : 'Your account'}</h2></div><button className="close-button" onClick={() => setPanel(null)}>×</button></div>{panel === 'project' && <><input autoFocus value={newProject} onChange={(event) => setNewProject(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addProject()} placeholder="Project name" /><div className="modal-footer"><button className="secondary-button" onClick={() => setPanel(null)}>Cancel</button><button className="primary-button" onClick={addProject}>Create project</button></div></>}{panel === 'help' && <div className="panel-copy"><p>Find answers about tasks, projects, attachments, and realtime activity.</p><button className="secondary-button" onClick={() => setPanel('settings')}>Open workspace guide</button></div>}{panel === 'settings' && <div className="panel-copy"><label className="setting-row"><span>Email notifications</span><input type="checkbox" defaultChecked /></label><label className="setting-row"><span>Realtime activity</span><input type="checkbox" defaultChecked /></label><button className="primary-button" onClick={() => setPanel(null)}>Done</button></div>}{panel === 'account' && <div className="panel-copy"><div className="account-summary"><Avatar initials="AM" color="#ff8a65" /><strong>Alex Morgan</strong><small>alex@acme.co</small></div><button className="secondary-button" onClick={() => setPanel(null)}>Sign out</button></div>}</div></div>}
  </div>
}

export default App
