import React, { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './styles.css';

const focusableSelector = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function Icon({ name, size = 20 }) {
  const paths = {
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    keyboard: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M18 10h.01M7 14h.01M17 14h.01M10 14h4"/></>,
    spark: <><path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z"/><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z"/></>
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Modal({ open, onClose, title, description, children, role = 'dialog', closeOnBackdrop = true }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      const preferred = panel.querySelector('[data-autofocus]');
      (preferred || panel.querySelector(focusableSelector) || panel).focus();
    }, 30);

    function onKeyDown(event) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = [...panel.querySelectorAll(focusableSelector)].filter(el => el.offsetParent !== null);
      if (!items.length) { event.preventDefault(); panel.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      setTimeout(() => returnFocusRef.current?.focus(), 0);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="modal-layer" onMouseDown={event => {
      if (closeOnBackdrop && event.target === event.currentTarget) onClose();
    }}>
      <div className="modal-card" ref={panelRef} role={role} aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1}>
        <button className="icon-button close-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        <div className="modal-kicker"><span className="dot" /> Accessible dialog</div>
        <h2 id={titleId}>{title}</h2>
        {description && <p id={descriptionId} className="modal-description">{description}</p>}
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function App() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dialogues-entries')) || []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem('dialogues-entries', JSON.stringify(entries)); }, [entries]);

  const save = event => {
    const data = new FormData(event.currentTarget);
    setEntries(items => [{ id: crypto.randomUUID(), name: data.get('name'), email: data.get('email'), role: data.get('role'), createdAt: new Date().toLocaleDateString() }, ...items]);
    setSaved(true);
    setDemoOpen(false);
    setTimeout(() => setSaved(false), 3200);
  };

  const removeEntry = id => setEntries(items => items.filter(item => item.id !== id));

  return <>
    <header className="site-header">
      <a href="#main" className="brand" aria-label="Dialogues home"><span>D</span> Dialogues</a>
      <nav aria-label="Primary navigation">
        <a href="#principles">Principles</a><a href="#patterns">Patterns</a><a href="#usage">Usage</a>
      </nav>
      <button className="header-button" onClick={() => setDemoOpen(true)}>Open demo <Icon name="arrow" size={17} /></button>
    </header>

    <main id="main">
      <section className="hero">
        <div className="eyebrow"><Icon name="spark" size={16} /> Thoughtful by default</div>
        <h1>A better way to<br/><em>ask for attention.</em></h1>
        <p className="hero-copy">A small, dependable modal system for React—built around the people who navigate by keyboard, screen reader, or instinct.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => setDemoOpen(true)}>Experience the modal <Icon name="arrow" size={18}/></button>
          <a className="text-link" href="#principles">Explore the principles</a>
        </div>
        <div className="orb" aria-hidden="true"><div className="orb-inner"><Icon name="keyboard" size={34}/><span>Press Enter</span></div></div>
      </section>

      <section className="principles" id="principles">
        <div className="section-intro"><span>01 — The foundation</span><h2>Good manners,<br/>built into the code.</h2></div>
        <div className="feature-grid">
          <article><div className="feature-icon"><Icon name="keyboard" /></div><p className="number">01</p><h3>Focus stays put</h3><p>Keyboard focus moves into the dialog, cycles within it, and returns exactly where it began.</p></article>
          <article><div className="feature-icon"><Icon name="lock" /></div><p className="number">02</p><h3>Context is clear</h3><p>Every dialog announces its title, purpose, and urgency without relying on visual styling alone.</p></article>
          <article><div className="feature-icon"><Icon name="layers" /></div><p className="number">03</p><h3>Escape is easy</h3><p>Close with Escape, the dismiss button, or the backdrop. Nothing leaves a visitor feeling trapped.</p></article>
        </div>
      </section>

      <section className="patterns" id="patterns">
        <div><span className="section-label">02 — Two clear patterns</span><h2>Right amount<br/>of interruption.</h2></div>
        <div className="pattern-list">
          <button onClick={() => setDemoOpen(true)}><span><small>STANDARD DIALOG</small><strong>Gather information</strong></span><Icon name="arrow" /></button>
          <button onClick={() => setConfirmOpen(true)}><span><small>ALERT DIALOG</small><strong>Confirm a decision</strong></span><Icon name="arrow" /></button>
        </div>
      </section>


      <section className="workspace" aria-labelledby="workspace-title">
        <div className="workspace-head">
          <div><span className="section-label">03 — Live workspace</span><h2 id="workspace-title">Saved responses</h2><p>Add a response through the modal. Your data stays saved in this browser.</p></div>
          <button className="primary" onClick={() => setDemoOpen(true)}>Add response <span aria-hidden="true">+</span></button>
        </div>
        {entries.length === 0 ? <div className="empty-state"><h3>No responses yet</h3><p>Use the form to add your first response.</p><button className="secondary" onClick={() => setDemoOpen(true)}>Add the first one</button></div> :
          <div className="entry-grid">{entries.map(entry => <article className="entry-card" key={entry.id}>
            <div className="avatar" aria-hidden="true">{entry.name.charAt(0).toUpperCase()}</div>
            <div><h3>{entry.name}</h3><a href={'mailto:' + entry.email}>{entry.email}</a><p>{entry.role}</p><small>Added {entry.createdAt}</small></div>
            <button className="remove-button" onClick={() => removeEntry(entry.id)} aria-label={'Remove ' + entry.name}><Icon name="close" size={17}/></button>
          </article>)}</div>}
      </section>
      <section className="usage" id="usage">
        <p>Accessible doesn’t have to mean complicated.</p>
        <button className="primary dark" onClick={() => setDemoOpen(true)}>Try it yourself <Icon name="arrow" size={18}/></button>
      </section>
    </main>

    <footer><a className="brand" href="#main"><span>D</span> Dialogues</a><p>Designed for everyone. Built with React.</p><p>WCAG minded · Keyboard ready</p></footer>

    <Modal open={demoOpen} onClose={() => setDemoOpen(false)} title="Tell us a little about you" description="This short form demonstrates focus management, clear labels, and predictable keyboard behavior.">
      <form onSubmit={e => { e.preventDefault(); save(e); }}>
        <label htmlFor="name">Your name</label><input data-autofocus id="name" name="name" autoComplete="name" placeholder="Ada Lovelace" required />
        <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="ada@example.com" required />
        <label htmlFor="role">What brings you here?</label>
        <select id="role" name="role" defaultValue="" required><option value="" disabled>Choose one</option><option>Exploring accessibility</option><option>Building a design system</option><option>Learning React</option></select>
        <div className="modal-actions"><button type="button" className="secondary" onClick={() => setDemoOpen(false)}>Cancel</button><button className="primary" type="submit">Continue <Icon name="arrow" size={17}/></button></div>
        <p className="keyboard-hint"><kbd>Tab</kbd> to navigate <span>·</span> <kbd>Esc</kbd> to close</p>
      </form>
    </Modal>

    <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} role="alertdialog" title="Ready to continue?" description="This alert dialog asks for an explicit decision before continuing." closeOnBackdrop={false}>
      <div className="confirmation-mark"><Icon name="check" size={28}/></div>
      <div className="modal-actions"><button data-autofocus className="secondary" onClick={() => setConfirmOpen(false)}>Not yet</button><button className="primary" onClick={() => { setConfirmOpen(false); setSaved(true); setTimeout(() => setSaved(false), 3200); }}>Yes, continue</button></div>
    </Modal>

    <div className={`toast ${saved ? 'show' : ''}`} role="status"><Icon name="check" size={18}/> Your response was saved.</div>
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);



