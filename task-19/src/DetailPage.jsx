import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { suggestions } from './data'

export default function DetailPage({ item, onBack, onOpen }) {
  const related = suggestions.filter(x => x.id !== item.id && x.category === item.category).slice(0, 2)
  const summary = `A thoughtful exploration of practical ideas for creating more intentional work, clearer decisions, and a calmer everyday life.`
  const sections = [
    ['Start with the right question', 'Progress rarely begins with having every answer. It begins by noticing what deserves your attention. Define the outcome, remove unnecessary noise, and make the next useful step small enough to begin today.'],
    ['Make space for better work', 'Quality needs room. Create simple boundaries around your time, tools, and environment. When the system supports focus, good decisions become easier and creative energy has somewhere to go.'],
    ['Learn through small experiments', 'Treat each attempt as useful information. Review what worked, keep the parts that helped, and adjust the rest. Consistent reflection turns isolated effort into a practice that improves over time.']
  ]
  return <main className="page detail-page">
    <nav className="nav"><button className="brand brand-button" onClick={onBack}><span className="brand-dot" />orivue<span>.</span></button><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> Back to search</button></nav>
    <article className="article-shell"><header className="article-header"><span className="category-link">{item.category}</span><h1>{item.title}</h1><p>{summary}</p><div className="article-meta"><div className="avatar">SL</div><div><strong>Orivue Editorial</strong><span><Clock size={13}/> {item.meta}</span></div><button onClick={() => navigator.clipboard?.writeText(location.href)}>Copy link</button></div></header>
      <div className="article-visual"><span>{String(item.id).padStart(2,'0')}</span><div>{item.title}</div></div>
      <div className="article-body"><p className="lead">{summary} This piece gives you a useful starting point—not another pile of information to manage.</p>{sections.map(([heading,body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<blockquote>“Curiosity becomes valuable when it changes the way we notice, choose, and act.”</blockquote></div>
    </article>
    <section className="related"><span className="section-label">KEEP EXPLORING</span><h2>Related ideas</h2><div>{related.map(x => <button key={x.id} onClick={() => onOpen(x)}><small>{x.category} · {x.meta}</small><strong>{x.title}</strong><ArrowRight size={18}/></button>)}</div></section>
    <footer><span>© 2026 Orivue Editorial</span><button onClick={onBack}>Explore the library</button></footer>
  </main>
}
