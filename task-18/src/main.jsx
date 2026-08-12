import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ChevronDown, Info, Trash2, TriangleAlert, X, XCircle, Zap } from 'lucide-react';
import './styles.css';

const TOASTS = {
  success: { title: 'Changes saved', message: 'Your preferences have been updated.', icon: Check },
  error: { title: 'Something went wrong', message: 'Please try again in a few moments.', icon: XCircle },
  warning: { title: 'Storage almost full', message: 'You have 10% of your storage remaining.', icon: TriangleAlert },
  info: { title: 'New update available', message: 'Refresh the page to get the latest version.', icon: Info },
};

function Toast({ toast, onClose }) {
  const Icon = TOASTS[toast.type].icon;
  const [paused, setPaused] = useState(false);

  return (
    <article
      className={`toast toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="toast__icon"><Icon size={18} strokeWidth={2.5} /></div>
      <div className="toast__content">
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button className="toast__close" onClick={() => onClose(toast.id)} aria-label="Dismiss notification">
        <X size={17} />
      </button>
      <span className={`toast__progress ${paused ? 'is-paused' : ''}`} style={{ '--duration': `${toast.duration}ms` }} />
    </article>
  );
}

function App() {
  const [toasts, setToasts] = useState([]);
  const [position, setPosition] = useState('bottom-right');
  const [duration, setDuration] = useState(5000);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const addToast = (type) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items.slice(-4), { id, type, duration, ...TOASTS[type] }]);
    timers.current.set(id, setTimeout(() => removeToast(id), duration));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <main className="page-shell">
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Toast home">
          <span className="brand__mark"><Zap size={16} fill="currentColor" /></span>
          toast<span className="brand__dot">.</span>
        </a>
        <a className="nav__link" href="#about">About this component <span>↗</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> Micro interaction no. 04</div>
        <h1>Say it, then<br /><em>let it go.</em></h1>
        <p className="hero__copy">A lightweight notification system designed to inform without interrupting. Pick a message below and watch it appear.</p>
        <div className="configuration">
          <label>Position<span className="select-wrap"><select value={position} onChange={(e) => setPosition(e.target.value)}><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select><ChevronDown size={13} /></span></label>
          <label>Duration<span className="select-wrap"><select value={duration} onChange={(e) => setDuration(Number(e.target.value))}><option value="3000">3 seconds</option><option value="5000">5 seconds</option><option value="8000">8 seconds</option></select><ChevronDown size={13} /></span></label>
        </div>

        <div className="controls" aria-label="Toast notification controls">
          {Object.keys(TOASTS).map((type) => (
            <button key={type} className={`trigger trigger--${type}`} onClick={() => addToast(type)}>
              <span className="trigger__symbol">
                {React.createElement(TOASTS[type].icon, { size: 17, strokeWidth: 2.4 })}
              </span>
              <span><strong>{type}</strong><small>{TOASTS[type].title}</small></span>
              <span className="trigger__arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="details" id="about">
        <p>Built for the moments that matter—<br />and disappear.</p>
        <div className="detail-grid">
          <div><span>01</span><strong>Non-blocking</strong><p>Never gets in the way of your flow.</p></div>
          <div><span>02</span><strong>Auto-dismiss</strong><p>Gently fades after five seconds.</p></div>
          <div><span>03</span><strong>Stackable</strong><p>Multiple messages, neatly organized.</p></div>
        </div>
      </section>

      <aside className={`toast-stack toast-stack--${position}`} aria-live="polite" aria-atomic="false">
        {toasts.length > 1 && <button className="clear-all" onClick={() => setToasts([])}><Trash2 size={12} /> Clear all</button>}
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={removeToast} />)}
      </aside>
      <footer><span>INTERFACE STUDIES © 2026</span><span>REACT · CSS · GOOD TASTE</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
