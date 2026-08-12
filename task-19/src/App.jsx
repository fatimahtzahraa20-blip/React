import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, ChevronDown, Compass, FileText, Headphones, Search, Sparkles, X } from 'lucide-react'
import { suggestions, trending } from './data'
import DetailPage from './DetailPage'

const categories = ['All', 'Articles', 'Books', 'Guides', 'Podcasts']
const iconMap = { article: FileText, book: BookOpen, guide: Compass, podcast: Headphones }
const slugify = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const itemFromHash = () => suggestions.find(item => '#/item/' + slugify(item.title) === window.location.hash) || null

function highlight(text, query) {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part)
}

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(itemFromHash)
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('orivue-recent') || '[]'))
  const inputRef = useRef(null)
  const searchRef = useRef(null)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    return suggestions
      .filter(item => category === 'All' || item.category === category)
      .filter(item => !term || `${item.title} ${item.category} ${item.keywords}`.toLowerCase().includes(term))
      .slice(0, 6)
  }, [query, category])
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); inputRef.current?.focus(); setOpen(true)
      }
      if (event.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  const openItem = (item) => {
    window.location.hash = '/item/' + slugify(item.title)
    setSelected(item); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHome = () => { window.location.hash = ''; setSelected(null); setOpen(false); window.scrollTo({ top: 0 }) }

  useEffect(() => {
    const onHashChange = () => setSelected(itemFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const choose = (item) => {
    setQuery(item.title)
    const next = [item, ...recent.filter(old => old.id !== item.id)].slice(0, 3)
    setRecent(next); localStorage.setItem('orivue-recent', JSON.stringify(next)); openItem(item)
  }

  const onKeyDown = (event) => {
    if (!open || !results.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(i => (i + 1) % results.length) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive(i => (i <= 0 ? results.length - 1 : i - 1)) }
    if (event.key === 'Enter') { event.preventDefault(); choose(results[active >= 0 ? active : 0]) }
  }

  const startSearch = (term) => { setQuery(term); setOpen(true); setSelected(null); inputRef.current?.focus() }

  if (selected) return <DetailPage item={selected} onBack={goHome} onOpen={openItem} />

  return (
    <main className="page">
      <nav className="nav">
        <a className="brand" href="#" aria-label="Orivue home"><span className="brand-dot" />orivue<span>.</span></a>
        <div className="nav-right"><span>Ideas, clearly found.</span><button className="about">About</button></div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={14} /> THE ORIVUE COLLECTION</div>
        <h1>Find something<br /><em>worth keeping.</em></h1>
        <p className="subhead">Explore a focused collection of practical reads, useful guides, and thoughtful conversations.</p>

        <div className="search-wrap" ref={searchRef}>
          <div className={`search-box ${open ? 'focused' : ''}`}>
            <Search className="search-icon" size={22} />
            <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setActive(-1); setOpen(true); setSelected(null) }} onKeyDown={onKeyDown} placeholder="Search ideas, topics, or titles..." role="combobox" aria-expanded={open} aria-controls="results" aria-autocomplete="list" />
            {query && <button className="clear" onClick={() => { setQuery(''); setActive(-1); setSelected(null); setOpen(false); inputRef.current?.focus() }} aria-label="Clear search"><X size={18} /></button>}
            {!query && <kbd>⌘ K</kbd>}
            <button className={`toggle-results ${open ? 'open' : ''}`} onClick={() => { setOpen(value => !value); inputRef.current?.focus() }} aria-label={open ? 'Close suggestions' : 'Open suggestions'} aria-expanded={open}><ChevronDown size={19} /></button>
          </div>

          {open && (
            <div className="dropdown" id="results" role="listbox">
              <div className="results-head"><span>{query ? `${results.length} RESULTS` : 'EXPLORE THE LIBRARY'}</span><span>↑↓ to navigate · ↵ to select</span></div>
              {results.length ? results.map((item, index) => {
                const Icon = iconMap[item.icon]
                return <button key={item.id} className={`result ${active === index ? 'active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => choose(item)} role="option" aria-selected={active === index}>
                  <span className={`result-icon ${item.icon}`}><Icon size={19} /></span>
                  <span className="result-copy"><strong>{highlight(item.title, query)}</strong><small>{item.category} <i /> {item.meta}</small></span>
                  <ArrowRight className="result-arrow" size={18} />
                </button>
              }) : <div className="empty"><span>“</span><strong>No ideas found for “{query}”</strong><p>Try another phrase or browse a category below.</p></div>}
            </div>
          )}
        </div>

        <div className="filters" aria-label="Filter by category">
          {categories.map(item => <button key={item} className={category === item ? 'selected' : ''} onClick={() => { setCategory(item); setActive(-1); setOpen(true); inputRef.current?.focus() }}>{item}</button>)}
        </div>
      </section>

      <section className="lower">
        <div className="trending">
          <span className="section-label">TRENDING SEARCHES</span>
          <div>{trending.map((item, i) => <button key={item} onClick={() => startSearch(item)}><span>0{i + 1}</span>{item}<ArrowRight size={15} /></button>)}</div>
        </div>
        <aside className="note"><div className="scribble">✦</div><p>“Keep what moves your thinking forward.”</p><span>— THE ORIVUE EDIT</span></aside>
      </section>

      {selected && <div className="toast" role="status"><span>Added to your recent searches</span><strong>{selected.title}</strong><button onClick={() => setSelected(null)}><X size={16} /></button></div>}
      <footer><span>© 2026 Orivue</span><span>A clearer path to good ideas.</span></footer>
    </main>
  )
}
