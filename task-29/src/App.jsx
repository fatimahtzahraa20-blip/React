import { useEffect, useMemo, useRef, useState } from "react";

const defaults = {
  name: "Jordan Lee", username: "jordanlee", email: "jordan@example.com",
  bio: "Product designer based in Austin. Coffee enthusiast.",
  location: "Austin, TX", website: "https://jordanlee.design",
  productUpdates: true, securityAlerts: true, weeklyDigest: false, publicProfile: true, twoFactor: false, theme: "light", avatar: "",
};

const sections = [
  ["profile", "Profile", "Personal details and public profile"],
  ["notifications", "Notifications", "Choose what reaches your inbox"],
  ["privacy", "Privacy & security", "Manage visibility and account safety"],
  ["appearance", "Appearance", "Customize your workspace"],
];

function loadSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem("profile-settings")) }; }
  catch { return defaults; }
}

function apiSave(data) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (data.username === "taken") reject(new Error("That username is already in use."));
    else { localStorage.setItem("profile-settings", JSON.stringify(data)); resolve(data); }
  }, 850));
}

function validate(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = "Full name is required.";
  if (!/^[a-z0-9_]{3,20}$/.test(data.username)) errors.username = "Use 3–20 lowercase letters, numbers, or underscores.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.bio.length > 160) errors.bio = "Bio cannot exceed 160 characters.";
  if (data.website && !/^https?:\/\//i.test(data.website)) errors.website = "Website must start with http:// or https://.";
  return errors;
}

function Toggle({ checked, onChange, label, description }) {
  return <label className="toggle-row">
    <span><strong>{label}</strong><small>{description}</small></span>
    <input type="checkbox" checked={checked} onChange={onChange}/><i aria-hidden="true"/>
  </label>;
}

export default function App() {
  const initial = useMemo(loadSettings, []);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [active, setActive] = useState("profile");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); const [noticeOpen, setNoticeOpen] = useState(false); const [modal, setModal] = useState(null); const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" }); const fileRef = useRef();
  const timer = useRef();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const initials = (form.name.match(/\b[A-Za-z]/g) || ["?"]).slice(0, 2).join("").toUpperCase();

  useEffect(() => () => clearTimeout(timer.current), []); useEffect(() => { document.documentElement.dataset.theme = form.theme; }, [form.theme]);

  const setValue = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
    if (errors[key]) setErrors(current => ({ ...current, [key]: undefined }));
    if (status !== "saving") setStatus("idle");
  };

  async function save(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setActive("profile");
      setStatus("error"); setMessage("Please fix the highlighted fields.");
      setTimeout(() => document.querySelector(".invalid")?.focus());
      return;
    }
    clearTimeout(timer.current);
    const previous = saved;
    const optimistic = { ...form, name: form.name.trim(), email: form.email.trim() };
    setSaved(optimistic); setForm(optimistic); setStatus("saving"); setMessage("Saving changes…");
    try {
      await apiSave(optimistic);
      setStatus("saved"); setMessage("All changes saved");
      timer.current = setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setSaved(previous); setForm(previous); setStatus("error"); setMessage(error.message + " Changes were restored.");
    }
  }

  const field = (key, label, props = {}) => <div className={"field " + (props.wide ? "wide" : "")}>
    <label htmlFor={key}>{label}</label>
    <input id={key} className={errors[key] ? "invalid" : ""} value={form[key]} onChange={e => setValue(key, e.target.value)} {...props}/>
    {errors[key] && <small className="error">{errors[key]}</small>}
  </div>;

  return <div className="app">
    <nav className="navbar">
      <a className="brand" href="#"><span>P</span>Profile</a>
      <div className={"nav-links " + (menuOpen ? "open" : "")}>
        <button className={active === "profile" ? "active" : ""} onClick={() => { setActive("profile"); setMenuOpen(false); }}>Profile</button><button className={active === "notifications" ? "active" : ""} onClick={() => { setActive("notifications"); setMenuOpen(false); }}>Notifications</button><button className={active === "privacy" ? "active" : ""} onClick={() => { setActive("privacy"); setMenuOpen(false); }}>Security</button><button className={active === "appearance" ? "active" : ""} onClick={() => { setActive("appearance"); setMenuOpen(false); }}>Appearance</button>
      </div>
      <div className="nav-actions"><div className="notice-wrap"><button className="icon-button" aria-label="Notifications" onClick={() => setNoticeOpen(!noticeOpen)}>◌<b/></button>{noticeOpen && <div className="notice-menu"><strong>Notifications</strong><p>Your account settings are up to date.</p><button onClick={() => { setActive("notifications"); setNoticeOpen(false); }}>Manage notifications</button></div>}</div><button className="nav-avatar" onClick={() => setActive("profile")} aria-label="Open profile">{form.avatar ? <img src={form.avatar} alt=""/> : initials}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button></div>
    </nav>

    <main className="page" id="settings">
      <header className="page-header"><div><p className="eyebrow">ACCOUNT SETTINGS</p><h1>Settings</h1><p>Manage your profile, preferences, and account security.</p></div><div className="saved-badge"><span>{initials}</span><div><strong>{saved.name}</strong><small>@{saved.username}</small></div></div></header>
      <form onSubmit={save}>
        <div className="settings-layout">
          <aside className="sidebar" aria-label="Settings sections">
            {sections.map(([id, title, description]) => <button type="button" key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><span>{id === "profile" ? "◎" : id === "notifications" ? "♢" : id === "privacy" ? "⌾" : "◐"}</span><div><strong>{title}</strong><small>{description}</small></div></button>)}
          </aside>
          <section className="panel">
            {active === "profile" && <><div className="panel-title"><div><h2>Profile information</h2><p>Update your photo and personal details.</p></div></div>
              <div className="avatar-editor"><div className="large-avatar">{form.avatar ? <img src={form.avatar} alt="Profile preview"/> : initials}</div><div><strong>Profile photo</strong><p>JPG, GIF or PNG. Max size 2MB.</p><input ref={fileRef} className="file-input" type="file" accept="image/png,image/jpeg,image/gif" onChange={e => { const file=e.target.files?.[0]; if(!file) return; if(file.size > 2097152){setStatus("error");setMessage("Photo must be smaller than 2MB.");return;} const reader=new FileReader();reader.onload=()=>setValue("avatar",reader.result);reader.readAsDataURL(file); }}/><button type="button" className="text-button" onClick={() => fileRef.current?.click()}>Upload new photo</button>{form.avatar && <button type="button" className="text-button remove-photo" onClick={() => setValue("avatar","")}>Remove</button>}</div></div>
              <div className="fields">{field("name", "Full name")}{field("username", "Username")}{field("email", "Email address", { type:"email", wide:true })}{field("location", "Location")}{field("website", "Website")}</div>
              <div className="field bio"><div className="label-line"><label htmlFor="bio">Bio</label><span>{form.bio.length}/160</span></div><textarea id="bio" className={errors.bio ? "invalid" : ""} value={form.bio} onChange={e => setValue("bio", e.target.value)}/>{errors.bio && <small className="error">{errors.bio}</small>}</div>
            </>}
            {active === "notifications" && <><div className="panel-title"><h2>Notification preferences</h2><p>Control which updates we send you.</p></div><div className="setting-list">
              <Toggle label="Product updates" description="News about new features and improvements." checked={form.productUpdates} onChange={e => setValue("productUpdates", e.target.checked)}/>
              <Toggle label="Security alerts" description="Important notices about your account." checked={form.securityAlerts} onChange={e => setValue("securityAlerts", e.target.checked)}/>
              <Toggle label="Weekly digest" description="A weekly summary of your account activity." checked={form.weeklyDigest} onChange={e => setValue("weeklyDigest", e.target.checked)}/>
            </div></>}
            {active === "privacy" && <><div className="panel-title"><h2>Privacy & security</h2><p>Manage your public visibility and sign-in security.</p></div><div className="setting-list"><Toggle label="Public profile" description="Allow other members to view your profile." checked={form.publicProfile} onChange={e => setValue("publicProfile", e.target.checked)}/><div className="action-row"><span><strong>Password</strong><small>Last changed 3 months ago</small></span><button type="button" className="outline-button" onClick={() => setModal("password")}>Change password</button></div><div className="action-row"><span><strong>Two-factor authentication</strong><small>{form.twoFactor ? "Enabled on this account." : "Add an extra layer of security."}</small></span><button type="button" className="outline-button" onClick={() => setValue("twoFactor", !form.twoFactor)}>{form.twoFactor ? "Disable" : "Set up"}</button></div></div></>}
            {active === "appearance" && <><div className="panel-title"><h2>Appearance</h2><p>Choose how Orbit looks on this device.</p></div><div className="theme-options"><button type="button" className={form.theme === "light" ? "selected" : ""} onClick={() => setValue("theme","light")}><i className="light-preview"/><strong>Light</strong><small>Bright and clean</small></button><button type="button" className={form.theme === "dark" ? "selected" : ""} onClick={() => setValue("theme","dark")}><i className="dark-preview"/><strong>Dark</strong><small>Easy on the eyes</small></button><button type="button" className={form.theme === "system" ? "selected" : ""} onClick={() => setValue("theme","system")}><i className="system-preview"/><strong>System</strong><small>Match your device</small></button></div></>}
            <footer className="form-footer"><div className={"status " + status} role="status" aria-live="polite">{status === "saving" && <i/>}{status === "saved" && "✓ "}{status === "error" && "! "}{message}</div><div><button type="button" className="cancel" disabled={!dirty || status === "saving"} onClick={() => { setForm(saved); setErrors({}); setStatus("idle"); }}>Discard</button><button className="save" type="submit" disabled={!dirty || status === "saving"}>{status === "saving" ? "Saving…" : "Save changes"}</button></div></footer>
          </section>
        </div>
      </form>
    </main>
  </div>;
}

