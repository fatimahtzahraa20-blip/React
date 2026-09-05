import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Check, FileClock, Folder, FolderPlus, Inbox, Mail, Moon,
  Search, Settings, Sparkles, Sun, UserPlus, Users, X,
} from 'lucide-react'

const starterProjects = [
  { id: 1, name: 'Website refresh', description: 'Landing page and design system', updated: 'Today', color: '#d77a4a' },
  { id: 2, name: 'Mobile application', description: 'Product flows and prototypes', updated: 'Yesterday', color: '#39775b' },
  { id: 3, name: 'Launch campaign', description: 'Content and campaign planning', updated: '3 days ago', color: '#8570b3' },
]

const commandDefinitions = [
  { group: 'Actions', icon: FolderPlus, title: 'Create a new project', subtitle: 'Add a project to your workspace', action: 'create', keys: ['Ctrl', 'N'] },
  { group: 'Actions', icon: Search, title: 'Search workspace', subtitle: 'Find projects and people', action: 'search', keys: ['Ctrl', 'F'] },
  { group: 'Navigate', icon: Inbox, title: 'Open inbox', subtitle: 'View your notifications', action: 'inbox', keys: ['G', 'I'] },
  { group: 'Navigate', icon: FileClock, title: 'Open recent projects', subtitle: 'Pick up where you left off', action: 'recent', keys: ['G', 'R'] },
  { group: 'Actions', icon: UserPlus, title: 'Invite a teammate', subtitle: 'Add someone to your workspace', action: 'invite', keys: [] },
  { group: 'Preferences', icon: Moon, title: 'Toggle appearance', subtitle: 'Switch between light and dark', action: 'theme', keys: ['Ctrl', 'D'] },
  { group: 'Preferences', icon: Settings, title: 'Open settings', subtitle: 'Manage your preferences', action: 'settings', keys: ['Ctrl', ','] },
]

function Shortcut({ keys }) {
  return <span className="shortcut">{keys.map((key) => <kbd key={key}>{key}</kbd>)}</span>
}

function CommandPalette({ open, onClose, onRun, dark, projects }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const items = useMemo(() => {
    const projectCommands = projects.map((project) => ({
      group: 'Projects', icon: Folder, title: project.name, subtitle: project.description,
      action: 'project', project, keys: [],
    }))
    const all = [...commandDefinitions, ...projectCommands]
    const term = query.toLowerCase().trim()
    return term ? all.filter((item) => [item.title, item.subtitle, item.group].join(' ').toLowerCase().includes(term)) : all
  }, [query, projects])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      window.setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const run = (item) => {
    onClose()
    window.setTimeout(() => onRun(item), 100)
  }

  const handleKeys = (event) => {
    if (event.key === 'Escape') onClose()
    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault()
      setActive((value) => (value + 1) % items.length)
    }
    if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault()
      setActive((value) => (value - 1 + items.length) % items.length)
    }
    if (event.key === 'Enter' && items[active]) run(items[active])
  }

  let previousGroup = ''
  return (
    <div className={`palette-backdrop ${open ? 'open' : ''}`} aria-hidden={!open} onKeyDown={handleKeys} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="palette-search">
          <Search size={20} />
          <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} placeholder="Type a command or project..." aria-label="Search commands" />
          {query ? <button className="icon-button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button> : <kbd>ESC</kbd>}
        </div>
        {items.length ? <div className="command-list" role="listbox">
          {items.map((item, index) => {
            const Icon = item.action === 'theme' && dark ? Sun : item.icon
            const showGroup = item.group !== previousGroup
            previousGroup = item.group
            return <div key={`${item.group}-${item.title}`}>
              {showGroup && <div className="group-label">{item.group}</div>}
              <button className={`command ${index === active ? 'selected' : ''}`} role="option" aria-selected={index === active} onMouseEnter={() => setActive(index)} onClick={() => run(item)}>
                <span className="command-icon"><Icon size={17} /></span>
                <span className="command-copy"><span className="command-title">{item.title}</span><span className="command-subtitle">{item.subtitle}</span></span>
                <Shortcut keys={item.keys} />
              </button>
            </div>
          })}
        </div> : <div className="empty-state visible"><Search size={28} /><h3>No results found</h3><p>Try a different search.</p></div>}
        <div className="palette-footer"><div><kbd>Up</kbd><kbd>Down</kbd><span>navigate</span></div><div><kbd>Enter</kbd><span>select</span></div><div><kbd>Esc</kbd><span>close</span></div></div>
      </section>
    </div>
  )
}

function Modal({ title, subtitle, children, onClose }) {
  return <div className="form-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="form-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-close" onClick={onClose} aria-label="Close"><X size={17} /></button>
      <h2>{title}</h2><p>{subtitle}</p>{children}
    </section>
  </div>
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [view, setView] = useState('home')
  const [modal, setModal] = useState(null)
  const [dark, setDark] = useState(() => localStorage.getItem('command-workspace-theme') === 'dark')
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('command-workspace-projects')
    return saved ? JSON.parse(saved) : starterProjects
  })
  const [members, setMembers] = useState(() => JSON.parse(localStorage.getItem('command-workspace-members') || '[]'))
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const workspaceSearch = useRef(null)

  const notify = (message) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('command-workspace-theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => localStorage.setItem('command-workspace-projects', JSON.stringify(projects)), [projects])
  useEffect(() => localStorage.setItem('command-workspace-members', JSON.stringify(members)), [members])

  const openView = (nextView) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const runCommand = (item) => {
    const actions = {
      create: () => setModal('create'),
      search: () => { openView('workspace'); window.setTimeout(() => workspaceSearch.current?.focus(), 120) },
      inbox: () => openView('inbox'),
      recent: () => openView('recent'),
      invite: () => setModal('invite'),
      theme: () => { setDark((value) => !value); notify('Appearance updated') },
      settings: () => openView('settings'),
      project: () => { openView('workspace'); setSearch(item.project.name); notify(`Opened ${item.project.name}`) },
    }
    actions[item.action]?.()
  }

  useEffect(() => {
    const keyboard = (event) => {
      const key = event.key.toLowerCase()
      if ((event.metaKey || event.ctrlKey) && key === 'k') { event.preventDefault(); setPaletteOpen((value) => !value) }
      if ((event.metaKey || event.ctrlKey) && key === 'n') { event.preventDefault(); setModal('create') }
      if ((event.metaKey || event.ctrlKey) && key === 'f') { event.preventDefault(); setView('workspace'); window.setTimeout(() => workspaceSearch.current?.focus(), 120) }
      if ((event.metaKey || event.ctrlKey) && key === 'd') { event.preventDefault(); setDark((value) => !value) }
      if ((event.metaKey || event.ctrlKey) && event.key === ',') { event.preventDefault(); openView('settings') }
    }
    document.addEventListener('keydown', keyboard)
    return () => document.removeEventListener('keydown', keyboard)
  }, [])

  const createProject = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const project = { id: Date.now(), name: data.get('name'), description: data.get('description') || 'New workspace project', updated: 'Just now', color: data.get('color') }
    setProjects((items) => [project, ...items])
    setModal(null); openView('workspace'); notify(`${project.name} created`)
  }
  const inviteMember = (event) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    setMembers((items) => [...items, { id: Date.now(), email }])
    setModal(null); notify(`Invitation sent to ${email}`)
  }

  const filteredProjects = projects.filter((project) => [project.name, project.description].join(' ').toLowerCase().includes(search.toLowerCase()))
  const pageTitles = { workspace: ['Workspace', 'All of your active projects.'], inbox: ['Inbox', 'Updates that need your attention.'], recent: ['Recent projects', 'Continue where you left off.'], settings: ['Settings', 'Customize your Orbit experience.'] }

  return <>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <button className="brand brand-button" onClick={() => openView('home')}><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Command Workspace</span></button>
      <nav aria-label="Primary navigation"><button onClick={() => openView('workspace')}>Workspace</button><button onClick={() => openView('inbox')}>Inbox</button><button onClick={() => openView('settings')}>Settings</button></nav>
      <button className="avatar" onClick={() => setModal('invite')} aria-label="Invite member">LM</button>
    </header>

    <main>
      {view === 'home' ? <>
        <section className="hero"><p className="eyebrow"><span /> Your workspace, at light speed</p><h1>Anything you need.<br /><em>One command away.</em></h1><p className="subhead">Move through your work without breaking your flow. Search, navigate, and take action from one beautifully simple place.</p><button className="open-palette" onClick={() => setPaletteOpen(true)}><Search size={18} /><span>What would you like to do?</span><kbd>Ctrl K</kbd></button><p className="hint">Press <kbd>Ctrl K</kbd> anywhere to open</p></section>
        <section className="features"><article><span className="feature-icon"><Search size={17} /></span><div><h2>Find anything</h2><p>Search across every project.</p></div></article><article><span className="feature-icon"><FolderPlus size={17} /></span><div><h2>Create quickly</h2><p>Add and save real projects.</p></div></article><article><span className="feature-icon"><Sparkles size={17} /></span><div><h2>Do everything</h2><p>Run actions from one place.</p></div></article></section>
      </> : <section className="workspace-page">
        <button className="back-link" onClick={() => openView('home')}><ArrowLeft size={15} /> Home</button>
        <div className="page-heading"><div><h1>{pageTitles[view][0]}</h1><p>{pageTitles[view][1]}</p></div>{view === 'workspace' && <button className="primary-button" onClick={() => setModal('create')}><FolderPlus size={16} /> New project</button>}</div>
        {(view === 'workspace' || view === 'recent') && <>
          {view === 'workspace' && <label className="workspace-search"><Search size={17} /><input ref={workspaceSearch} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." />{search && <button onClick={() => setSearch('')}><X size={14} /></button>}</label>}
          <div className="project-grid">{filteredProjects.map((project) => <button className="project-card" key={project.id} onClick={() => notify(`Opened ${project.name}`)}><span className="project-color" style={{ background: project.color }} /><Folder size={20} /><h3>{project.name}</h3><p>{project.description}</p><small>Updated {project.updated}</small></button>)}</div>
          {!filteredProjects.length && <div className="panel-empty"><Search /><h3>No projects found</h3><p>Change your search or create a new project.</p></div>}
        </>}
        {view === 'inbox' && <div className="inbox-list"><article><span><Mail size={17} /></span><div><h3>Welcome to Orbit</h3><p>Your workspace is ready. Press Ctrl K to run your first command.</p></div><small>Now</small></article>{members.map((member) => <article key={member.id}><span><UserPlus size={17} /></span><div><h3>Invitation sent</h3><p>{member.email} was invited to this workspace.</p></div><small>Recent</small></article>)}</div>}
        {view === 'settings' && <div className="settings-panel"><div><span><Moon size={18} /></span><div><h3>Dark appearance</h3><p>Use a darker interface in low-light environments.</p></div><button className={`toggle ${dark ? 'on' : ''}`} onClick={() => setDark((value) => !value)} aria-label="Toggle dark appearance"><i /></button></div><div><span><Users size={18} /></span><div><h3>Workspace members</h3><p>{members.length + 1} member{members.length ? 's' : ''} currently in this workspace.</p></div><button className="text-button" onClick={() => setModal('invite')}>Invite</button></div></div>}
      </section>}
    </main>

    <footer><span>Command Workspace</span><button onClick={() => setPaletteOpen(true)}>Open commands <kbd>Ctrl K</kbd></button></footer>
    <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onRun={runCommand} dark={dark} projects={projects} />

    {modal === 'create' && <Modal title="Create a project" subtitle="Give your new project a clear name." onClose={() => setModal(null)}><form onSubmit={createProject}><label>Project name<input name="name" required autoFocus placeholder="e.g. Summer campaign" /></label><label>Description<input name="description" placeholder="What is this project about?" /></label><label>Accent color<input name="color" type="color" defaultValue="#39775b" /></label><button className="primary-button submit-button" type="submit">Create project</button></form></Modal>}
    {modal === 'invite' && <Modal title="Invite a teammate" subtitle="They will receive an invitation to this workspace." onClose={() => setModal(null)}><form onSubmit={inviteMember}><label>Email address<input name="email" type="email" required autoFocus placeholder="name@company.com" /></label><button className="primary-button submit-button" type="submit">Send invitation</button></form></Modal>}
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite"><span><Check size={11} /></span><span>{toast}</span></div>
  </>
}