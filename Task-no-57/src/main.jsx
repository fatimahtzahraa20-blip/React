import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const categories = ['Engineering', 'Design', 'Product', 'Marketing'];
const demoItems = Array.from({ length: 1500 }, (_, index) => ({
  id: index + 1, name: `${['Build', 'Review', 'Improve', 'Explore', 'Document'][index % 5]} ${['dashboard', 'checkout', 'analytics', 'navigation', 'workspace', 'onboarding', 'search'][index % 7]} experience ${index + 1}`,
  category: categories[index % 4], status: ['In progress', 'Complete', 'Planned'][index % 3],
}));
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = url && key ? createClient(url, key) : null;
const PAGE_SIZE = 50;

// React.memo skips unchanged rows; the parent supplies a stable callback.
const ItemRow = memo(function ItemRow({ item, selected, onToggle }) {
  return <div className={`item-row ${selected ? 'selected' : ''}`}>
    <input type="checkbox" checked={selected} onChange={() => onToggle(item.id)} aria-label={`Select ${item.name}`} />
    <div className="item-name"><strong>{item.name}</strong><span>TSK-{String(item.id).padStart(4, '0')}</span></div>
    <span className="category" data-category={item.category}>{item.category}</span>
    <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}><i />{item.status}</span>
  </div>;
});

function App() {
  const [items, setItems] = useState(supabase ? [] : demoItems);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('id');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    async function fetchItems() {
      try {
        const all = [];
        // Range requests avoid Supabase's default 1,000-row response limit.
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from('task_67_items').select('id,name,category,status').order('id').range(offset, offset + 499);
          if (error) throw error;
          if (!active) return;
          all.push(...data);
          if (data.length < 500) break;
        }
        if (active) setItems(all);
      } catch (error) { if (active) setError(error.message); }
      finally { if (active) setLoading(false); }
    }
    fetchItems();
    return () => { active = false; };
  }, []);

  // Filtering and sorting only rerun when their actual inputs change.
  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter(item => (category === 'All categories' || item.category === category) && item.name.toLowerCase().includes(term))
      .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : a.id - b.id);
  }, [items, query, category, sort]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = useMemo(() => filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredItems, currentPage]);
  const completed = useMemo(() => items.filter(item => item.status === 'Complete').length, [items]);
  // Functional updates keep this callback stable across selection changes.
  const toggleItem = useCallback(id => {
    setSelected(previous => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return <div className="layout">
    <header className="topbar"><a className="brand" href="./">Searcher</a><span className="top-label">Task workspace</span><span className="connection"><i />{supabase ? 'Supabase configured' : 'Demo dataset'}</span></header>
    <main>
      <section className="intro"><div><h1>Find your task</h1><p>Search and filter your workspace in one place.</p></div><div className="summary"><span><strong>{items.length.toLocaleString()}</strong> tasks</span><span><strong>{completed.toLocaleString()}</strong> completed</span><span><strong>{selected.size}</strong> selected</span></div></section>
      <section className="list-panel" id="explorer"><div className="panel-title"><div><h2>Tasks<span>{filteredItems.length.toLocaleString()}</span></h2></div><button disabled={!selected.size} onClick={() => setSelected(new Set())}>Clear selection <span aria-hidden="true">&#215;</span></button></div>
      <div className="filters"><label className="search"><span aria-hidden="true">&#8981;</span><input aria-label="Search tasks" placeholder="Search tasks by name..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />{query && <button className="clear-search" aria-label="Clear search" onClick={() => { setQuery(''); setPage(1); }}>&#215;</button>}</label><select aria-label="Sort tasks" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="id">Task number &#8593;</option><option value="name">Name A-Z</option></select></div>
      <div className="category-tabs" role="group" aria-label="Filter by category">{['All categories', ...categories].map(value => <button key={value} aria-pressed={category === value} className={category === value ? 'active' : ''} onClick={() => { setCategory(value); setPage(1); }}>{value === 'All categories' ? 'All tasks' : value}</button>)}</div>
      <div className="table-scroll"><div className="table-head"><span></span><span>Task</span><span>Category</span><span>Status</span></div>
      <div aria-live="polite">{loading ? <p className="empty">Loading tasks from Supabase...</p> : error ? <p className="empty error">Could not load tasks: {error}</p> : !filteredItems.length ? <div className="empty"><strong>No matches yet.</strong><p>Try a different name or category.</p><button onClick={() => { setQuery(''); setCategory('All categories'); setPage(1); }}>Reset filters</button></div> : visibleItems.map(item => <ItemRow key={item.id} item={item} selected={selected.has(item.id)} onToggle={toggleItem} />)}</div></div>
      <footer><span>{filteredItems.length ? `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredItems.length)}` : '0'} <em>/ {filteredItems.length.toLocaleString()} tasks</em></span><div><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>&#8592;</button><span>{String(currentPage).padStart(2, '0')} <em>/ {String(totalPages).padStart(2, '0')}</em></span><button aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>&#8594;</button></div></footer></section>
      <div className="page-bottom"><span>Searcher</span><span>Task 67</span></div>
    </main></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
