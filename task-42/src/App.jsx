import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { DASHBOARD_DATA, TRAFFIC_SOURCES, RECENT_ORDERS, ACTIVITY } from "./data.js";

const NAV = [
  { id: "overview", icon: "grid", label: "Overview" },
  { id: "reports", icon: "chart", label: "Reports" },
  { id: "orders", icon: "bag", label: "Orders" },
  { id: "activity", icon: "users", label: "Activity" },
];

const ICONS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  chart: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
  bag: <><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
};

function Icon({ name, size = 20 }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;
}

function Sidebar({ open, onClose, active, onNavigate }) {
  return <>
    <button className={`sidebar-overlay ${open ? "visible" : ""}`} onClick={onClose} aria-label="Close menu" />
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Main navigation">
      <div className="brand"><span className="brand-mark">D</span><div><strong>Dashboard</strong><small>Admin workspace</small></div></div>
      <nav>
        <span className="nav-heading">Workspace</span>
        {NAV.map(item => <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}
      </nav>
      <div className="sidebar-footer"><div className="avatar">AD</div><div><strong>Admin</strong><small>Administrator</small></div><span className="status-dot" title="Online" /></div>
    </aside>
  </>;
}

function KpiGrid({ items }) {
  const icons = ["$", "↗", "%", "◷"];
  return <section id="overview" className="kpi-grid" aria-label="Key performance indicators">
    {items.map((item, i) => <article className="kpi-card" key={item.label}>
      <div className={`kpi-icon tone-${i}`}>{icons[i]}</div>
      <div className="kpi-copy"><span className="label">{item.label}</span><strong className="value">{item.value}</strong><span className={`delta ${item.up ? "up" : "down"}`}><b>{item.up ? "↑" : "↓"} {item.delta}</b> vs previous period</span></div>
    </article>)}
  </section>;
}

function RevenueChart({ data, label }) {
  return <section className="panel chart-panel">
    <div className="panel-head"><div><span className="eyebrow">Performance</span><h3>Revenue overview</h3><p>Revenue generated during the selected period</p></div><span className="live-pill"><i /> Live data</span></div>
    <div className="chart-summary"><strong>{label}</strong><span>Selected period</span></div>
    <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
      <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity=".35"/><stop offset="100%" stopColor="#7c5cff" stopOpacity="0"/></linearGradient></defs>
      <CartesianGrid stroke="#e7e8ef" strokeDasharray="4 4" vertical={false}/><XAxis dataKey="label" stroke="#85899a" fontSize={11} tickLine={false} axisLine={false} dy={8}/><YAxis stroke="#85899a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`}/>
      <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: "#171823", border: 0, borderRadius: 10, color: "#fff" }} labelStyle={{ color: "#b7bac8" }}/>
      <Area type="monotone" dataKey="revenue" stroke="#6c4ff8" fill="url(#revenueFill)" strokeWidth={3} activeDot={{ r: 5, fill: "#6c4ff8", stroke: "#fff", strokeWidth: 3 }}/>
    </AreaChart></ResponsiveContainer></div>
  </section>;
}

function TrafficPie() {
  const colors = ["#6c4ff8", "#30b59b", "#f0a43c", "#e65d7b"];
  return <section className="panel traffic-panel"><div className="panel-head"><div><span className="eyebrow">Acquisition</span><h3>Traffic sources</h3><p>Sessions by channel</p></div></div>
    <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={TRAFFIC_SOURCES} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={4} stroke="none">{TRAFFIC_SOURCES.map((entry, i) => <Cell key={entry.name} fill={colors[i]} />)}</Pie><Tooltip formatter={v => [`${v}%`, "Share"]} contentStyle={{ border: 0, borderRadius: 10 }}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>38.4k</strong><span>sessions</span></div></div>
    <div className="legend">{TRAFFIC_SOURCES.map((item, i) => <div key={item.name}><i style={{ background: colors[i] }}/><span>{item.name}</span><strong>{item.value}%</strong></div>)}</div>
  </section>;
}

function OrdersTable({ search, setSearch }) {
  const visible = RECENT_ORDERS.filter(order => `${order.id} ${order.customer}`.toLowerCase().includes(search.toLowerCase()));
  return <section id="orders" className="panel orders-panel"><div className="panel-head"><div><span className="eyebrow">Transactions</span><h3>Recent orders</h3><p>Latest customer purchases</p></div><label className="table-search"><Icon name="search" size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders" aria-label="Search orders"/></label></div>
    <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{visible.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div className="customer"><span>{order.customer.split(" ").map(n => n[0]).join("")}</span>{order.customer}</div></td><td>{order.amount}</td><td><span className={`badge ${order.status}`}>{order.status === "success" ? "Paid" : order.status === "warn" ? "Pending" : "Failed"}</span></td></tr>)}</tbody></table>{!visible.length && <div className="empty-state">No orders match “{search}”.</div>}</div>
  </section>;
}

function ActivityFeed() {
  return <section id="activity" className="panel activity-panel"><div className="panel-head"><div><span className="eyebrow">Workspace</span><h3>Recent activity</h3><p>Latest events from your team</p></div></div><div className="activity-list">{ACTIVITY.map((item, i) => <div className="activity-item" key={item.id}><span className={`activity-icon activity-${i}`}>{i === 0 ? "↑" : i === 1 ? "+" : i === 2 ? "✓" : "•"}</span><div><p>{item.text}</p><time>{item.time}</time></div></div>)}</div></section>;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);
  const current = useMemo(() => DASHBOARD_DATA[range], [range]);

  useEffect(() => { const close = e => e.key === "Escape" && setSidebarOpen(false); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  const navigate = id => { setActive(id); setSidebarOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return <div className="dashboard">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active={active} onNavigate={navigate}/>
    <main>
      <header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Icon name="menu"/></button><div className="mobile-brand"><span className="brand-mark">D</span><strong>Dashboard</strong></div><div className="top-actions"><button className="icon-button" onClick={() => setNotice(!notice)} aria-label="Notifications"><Icon name="bell"/><span /></button><div className="header-avatar">AD</div></div>{notice && <div className="notification-popover"><strong>You’re all caught up</strong><span>No new notifications right now.</span></div>}</header>
      <div className="main-content">
        <section className="page-header"><div><span className="eyebrow">Dashboard</span><h1>Good morning, Admin</h1><p>Here’s what’s happening with your business today.</p></div><div className="date-range" role="group" aria-label="Dashboard date range">{Object.keys(DASHBOARD_DATA).map(value => <button key={value} className={range === value ? "active" : ""} onClick={() => setRange(value)} aria-pressed={range === value}>{value}</button>)}</div></section>
        <KpiGrid items={current.kpis}/>
        <div id="reports" className="analytics-grid"><RevenueChart data={current.revenue} label={current.total}/><TrafficPie/></div>
        <div className="details-grid"><OrdersTable search={search} setSearch={setSearch}/><ActivityFeed/></div>
        <footer>© 2026 Dashboard Analytics <span>System operational</span></footer>
      </div>
    </main>
  </div>;
}
