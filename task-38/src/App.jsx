import { useEffect, useState } from "react";
import { NAV_ITEMS, ROLES, can } from "./permissions.js";
import { AuthProvider, useAuth, Can, ProtectedSection } from "./access.jsx";

const SEED_USERS = [
  { id: 1, name: "Amina Yusuf", email: "amina@company.co", role: "admin" },
  { id: 2, name: "Ben Carter", email: "ben@company.co", role: "editor" },
  { id: 3, name: "Priya Nair", email: "priya@company.co", role: "editor" },
  { id: 4, name: "Wei Zhang", email: "wei@company.co", role: "viewer" },
];

function Sidebar({ activePage, onNavigate }) {
  const { role } = useAuth();
  return (
    <aside className="sidebar">
      <h1>{"\u{1F6E1}\uFE0F"} Admin Panel</h1>
      {NAV_ITEMS.map((item) => {
        const allowed = can(role, item.permission);
        return (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""} ${!allowed ? "locked" : ""}`}
            onClick={() => allowed && onNavigate(item.id)}
            title={!allowed ? "Restricted for your role" : ""}
          >
            <span>{item.icon} {item.label}</span>
            {!allowed && <span className="lock-icon" aria-label="Locked" />}
          </div>
        );
      })}
    </aside>
  );
}

function RoleSwitcher({ role, setRole }) {
  return (
    <div className="role-switcher" title="Switch role to see how the UI adapts">
      {ROLES.map((r) => (
        <button
          key={r}
          className={`role-btn ${role === r ? "active" : ""}`}
          onClick={() => setRole(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function DashboardPage() {
  const { role } = useAuth();
  const roleContent = { admin: ["Administrator overview", "Full access to users, billing, and workspace settings."], editor: ["Editor workspace", "Read-only access to team, billing, and settings information."], viewer: ["Viewer overview", "Read-only access to the dashboard and team directory."] }[role];
  return (
    <ProtectedSection permission="dashboard.view">
      <div className="stat-grid">
        <div className="stat-card"><div className="label">Active Users</div><div className="value">1,204</div></div>
        <div className="stat-card"><div className="label">MRR</div><div className="value">$18.2k</div></div>
        <div className="stat-card"><div className="label">Open Tickets</div><div className="value">7</div></div>
        <div className="stat-card"><div className="label">Uptime</div><div className="value">99.98%</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{roleContent[0]}</h3>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          {roleContent[1]}
        </p>
      </div>
    </ProtectedSection>
  );
}

function UsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("admin-users"));
      return Array.isArray(stored) ? stored : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "viewer" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("admin-users", JSON.stringify(users));
  }, [users]);

  function inviteUser(event) {
    event.preventDefault();
    const name = invite.name.trim();
    const email = invite.email.trim().toLowerCase();
    setError("");
    if (!name || !email) return setError("Name and email are required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (users.some((user) => user.email.toLowerCase() === email)) return setError("That email is already a team member.");
    setUsers((current) => [...current, { id: Date.now(), name, email, role: invite.role }]);
    setInvite({ name: "", email: "", role: "viewer" });
    setShowInvite(false);
    setMessage("User added successfully.");
  }

  function updateRole(id, newRole) {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, role: newRole } : user));
    setMessage("User role updated.");
  }

  function removeUser(id) {
    setUsers((current) => current.filter((user) => user.id !== id));
    setMessage("User removed.");
  }

  return (
    <ProtectedSection permission="users.view">
      <div className="permissions-note">
        Signed in as <b>{role}</b> — {can(role, "users.edit_role") ? "you can invite, edit, and remove users." : "you have read-only access to this list."}
      </div>
      {message && <div className="notice" role="status">{message}</div>}
      <Can permission="users.invite">
        {showInvite && (
          <form className="card invite-form" onSubmit={inviteUser}>
            <div className="card-heading"><h3>Invite user</h3></div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <div className="form-grid">
              <label>Name<input autoFocus value={invite.name} onChange={(event) => setInvite({ ...invite, name: event.target.value })} placeholder="Full name" /></label>
              <label>Email<input type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} placeholder="name@company.com" /></label>
              <label>Role<select value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}>{ROLES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            </div>
            <div className="form-actions"><button type="button" className="btn secondary" onClick={() => { setShowInvite(false); setError(""); }}>Cancel</button><button type="submit" className="btn primary">Add user</button></div>
          </form>
        )}
      </Can>
      <div className="card">
        <div className="card-heading"><h3>Team members</h3><Can permission="users.invite"><button className="btn primary" onClick={() => { setShowInvite(true); setMessage(""); }}>+ Invite user</button></Can></div>
        <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>
          {users.map((user) => <tr key={user.id}><td>{user.name}</td><td className="muted">{user.email}</td><td><Can permission="users.edit_role" fallback={<span className={`badge ${user.role}`}>{user.role}</span>}><select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>{ROLES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Can></td><td><Can permission="users.remove"><button className="btn danger" onClick={() => removeUser(user.id)}>Remove</button></Can></td></tr>)}
        </tbody></table></div>
      </div>
    </ProtectedSection>
  );
}

function BillingPage() {
  const { role } = useAuth();
  const [payment, setPayment] = useState(() => localStorage.getItem("payment-last4") || "4242");
  const [billingMessage, setBillingMessage] = useState("");
  function updatePayment() {
    const last4 = window.prompt("Enter the last 4 digits of the new card:", payment)?.trim();
    if (last4 == null) return;
    if (!/^\d{4}$/.test(last4)) return setBillingMessage("Enter exactly four digits.");
    setPayment(last4);
    localStorage.setItem("payment-last4", last4);
    setBillingMessage("Payment method updated.");
  }
  return (
    <ProtectedSection permission="billing.view">
      {billingMessage && <div className="notice" role="status">{billingMessage}</div>}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Billing</h3>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Plan: <b>Business</b> {" · "} Next invoice: Sep 1, 2026 {" · "} $499.00</p>
        <Can
          permission="billing.edit"
          fallback={<p style={{ fontSize: 13, color: "var(--muted)" }}>Your role ({role}) can view billing but not modify it.</p>}
        >
          <div className="billing-action"><span className="card-ending">Card ending in {payment}</span><button className="btn primary" onClick={updatePayment}>Update payment method</button></div>
        </Can>
      </div>
    </ProtectedSection>
  );
}

function SettingsPage() {
  const { role } = useAuth();
  const [savedName, setSavedName] = useState(() => localStorage.getItem("workspace-name") || "Acme Inc.");
  const [name, setName] = useState(savedName);
  const [settingsMessage, setSettingsMessage] = useState("");
  function saveChanges() {
    const cleanName = name.trim();
    if (!cleanName) return;
    setSavedName(cleanName);
    setName(cleanName);
    localStorage.setItem("workspace-name", cleanName);
    setSettingsMessage("Workspace settings saved.");
  }
  return (
    <ProtectedSection permission="settings.view">
      {settingsMessage && <div className="notice" role="status">{settingsMessage}</div>}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Workspace settings</h3>
        <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Workspace name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!can(role, "settings.edit")}
          style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 12px", borderRadius: 8, width: 280 }}
        />
        <div style={{ marginTop: 14 }}>
          <Can
            permission="settings.edit"
            fallback={<span style={{ fontSize: 12, color: "var(--muted)" }}>Read-only for your role.</span>}
          >
            <button className="btn primary" onClick={saveChanges} disabled={!name.trim() || name.trim() === savedName}>Save changes</button>
          </Can>
        </div>
      </div>
    </ProtectedSection>
  );
}

const PAGES = { dashboard: DashboardPage, users: UsersPage, billing: BillingPage, settings: SettingsPage };

function Shell({ page }) {
  const { role } = useAuth();
  const Page = PAGES[page];
  const activeMeta = NAV_ITEMS.find((n) => n.id === page);

  return (
    <div className="main">
      <div className="header-row">
        <h2>{activeMeta?.icon} {activeMeta?.label}</h2>
      </div>
      <Page key={role} />
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState("admin");
  const [page, setPage] = useState("dashboard");

  // If switching roles revokes access to the current page, fall back to dashboard.
  function handleSetRole(newRole) {
    setRole(newRole);
    if (!can(newRole, NAV_ITEMS.find((n) => n.id === page)?.permission)) {
      setPage("dashboard");
    }
  }

  return (
    <AuthProvider role={role}>
      <div className="app">
        <Sidebar activePage={page} onNavigate={setPage} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 32px 0" }}>
            <RoleSwitcher role={role} setRole={handleSetRole} />
          </div>
          <Shell page={page} />
        </div>
      </div>
    </AuthProvider>
  );
}










