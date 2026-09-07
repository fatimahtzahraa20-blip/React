import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialEvents = [
  { id: 'evt-8421', title: 'Payment intent timeout', source: 'checkout-api', time: '2 min ago', level: 'error', tag: 'production', detail: 'Upstream provider did not respond within 10s.' },
  { id: 'evt-8419', title: 'Deprecated route accessed', source: 'web-client', time: '18 min ago', level: 'warn', tag: 'staging', detail: 'A client requested /v1/events, which is scheduled for removal.' },
  { id: 'evt-8413', title: 'Logger connected', source: 'error-service', time: '41 min ago', level: 'info', tag: 'system', detail: 'Winston transports are healthy and accepting events.' },
]

function App() {
  const [events, setEvents] = useState(initialEvents)
  const [filter, setFilter] = useState('all')
  const [apiStatus, setApiStatus] = useState('checking')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const reportError = (event) => {
      fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: event.message, stack: event.error?.stack, source: 'browser' }) }).catch(() => undefined)
    }
    window.addEventListener('error', reportError)
    return () => window.removeEventListener('error', reportError)
  }, [])

  useEffect(() => {
    fetch('/api/health').then((response) => { if (!response.ok) throw new Error('API unavailable'); setApiStatus('online') }).catch(() => setApiStatus('offline'))
  }, [])

  const visibleEvents = useMemo(() => filter === 'all' ? events : events.filter((event) => event.level === filter), [events, filter])

  async function sendTestError() {
    const response = await fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Test error from the Task 72 dashboard', stack: 'Error: Test error from the Task 72 dashboard\n    at Dashboard.testError (App.jsx:42:11)', source: 'dashboard', context: { triggeredBy: 'manual-check' } }) })
    if (!response.ok) { setNotice('Could not reach the logging API.'); return }
    const { requestId } = await response.json()
    setEvents((current) => [{ id: requestId, title: 'Test error received', source: 'dashboard', time: 'just now', level: 'error', tag: 'manual', detail: `Winston accepted this event. Request ID: ${requestId}` }, ...current])
    setNotice('Test event written to logs/error.log')
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">+</span><span>signal<span className="brand-dot">.</span></span></div>
        <div className="workspace-switcher"><span className="workspace-icon">T</span><span><small>WORKSPACE</small><strong>Task 72 / Core</strong></span><span className="chevron">⌄</span></div>
        <nav className="nav-list" aria-label="Main navigation"><a className="nav-item active" href="#overview"><span>◈</span> Overview</a><a className="nav-item" href="#events"><span>≋</span> Error events <b>24</b></a><a className="nav-item" href="#services"><span>◌</span> Services</a><a className="nav-item" href="#settings"><span>⚙</span> Settings</a></nav>
        <div className="sidebar-bottom"><div className="plan-label"><span>PLAN USAGE</span><strong>43%</strong></div><div className="progress"><span /></div><p>4,306 of 10,000 events used</p><div className="user-chip"><span className="avatar">FT</span><span><strong>Fatima</strong><small>Administrator</small></span><span className="more">•••</span></div></div>
      </aside>
      <section className="content" id="overview">
        <header className="topbar"><div><p className="eyebrow">MONDAY, SEPTEMBER 07, 2026</p><h1>Good morning, Fatima</h1></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">◔<i /></button><button className="outline-button" onClick={sendTestError}><span>+</span> Send test error</button></div></header>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
        <div className="status-strip"><span className={`status-dot ${apiStatus}`} /><span>Global error handler</span><strong>{apiStatus === 'online' ? 'Operational' : apiStatus === 'offline' ? 'Offline' : 'Checking'}</strong><span className="status-divider" /><span>Last event</span><strong>just now</strong><span className="status-spacer" /><span className="pulse">●</span> Live monitoring</div>
        <section className="metrics" aria-label="Error metrics"><article className="metric-card accent"><span className="metric-icon">!</span><div><p>Total errors <span className="trend up">↑ 12.4%</span></p><strong>1,284</strong><small>vs. 1,142 last week</small></div><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /><i /></div></article><article className="metric-card"><span className="metric-icon yellow">◒</span><div><p>Unresolved <span className="trend down">↓ 8.2%</span></p><strong>36</strong><small>7 need attention</small></div><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div></article><article className="metric-card"><span className="metric-icon green">✓</span><div><p>System uptime</p><strong>99.98%</strong><small>Last 30 days</small></div><div className="uptime-ring">99</div></article></section>
        <div className="section-heading"><div><p className="eyebrow">ACTIVITY STREAM</p><h2>Recent error events</h2></div><div className="filters" role="group" aria-label="Filter events">{['all', 'error', 'warn', 'info'].map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All events' : item}</button>)}</div></div>
        <section className="event-layout" id="events"><div className="event-list">{visibleEvents.map((event) => <article className="event-row" key={event.id}><span className={`level-icon ${event.level}`}>{event.level === 'error' ? '!' : event.level === 'warn' ? '△' : 'i'}</span><div className="event-main"><div className="event-title"><h3>{event.title}</h3><span className={`tag ${event.tag}`}>{event.tag}</span></div><p>{event.detail}</p><small>{event.source} <span>·</span> {event.time}</small></div><button className="row-action" aria-label={`Open ${event.title}`}>›</button></article>)}</div><aside className="log-card"><div className="log-card-header"><div><p className="eyebrow">FILE TRANSPORT</p><h3>Winston logs</h3></div><span className="live-label"><i /> Writing</span></div><div className="terminal"><p><span className="terminal-time">10:42:08</span> <span className="terminal-info">INFO</span> Logger connected</p><p><span className="terminal-time">10:42:08</span> <span className="terminal-error">ERROR</span> Payment intent timeout</p><p><span className="terminal-time">10:41:52</span> <span className="terminal-warn">WARN</span> Deprecated route accessed</p><p><span className="terminal-time">10:39:14</span> <span className="terminal-info">INFO</span> Health check passed</p><p className="cursor">_</p></div><div className="log-path"><span>⌁</span><span><small>LOG FILE</small><strong>logs/error.log</strong></span><span className="file-ok">✓</span></div></aside></section>
      </section>
    </main>
  )
}

export default App
