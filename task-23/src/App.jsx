import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";

const TabsContext = createContext(null);

function useTabs(component) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`${component} must be used inside <Tabs>.`);
  return context;
}

function Tabs({ value, defaultValue, onValueChange, children, className = "" }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const listRef = useRef(null);
  const id = useId().replace(/:/g, "");
  const activeValue = value ?? internalValue;
  const select = useCallback((next) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }, [value, onValueChange]);
  const getTabId = (item) => `${id}-tab-${item}`;
  const getPanelId = (item) => `${id}-panel-${item}`;

  return <TabsContext.Provider value={{ activeValue, select, listRef, getTabId, getPanelId }}>
    <div className={`tabs ${className}`.trim()}>{children}</div>
  </TabsContext.Provider>;
}

function TabList({ children, ariaLabel = "Content sections" }) {
  const { listRef, select } = useTabs("TabList");
  const onKeyDown = (event) => {
    const tabs = Array.from(listRef.current?.querySelectorAll('[role="tab"]:not(:disabled)') ?? []);
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    select(tabs[next].dataset.value);
  };
  return <div className="tablist" role="tablist" aria-label={ariaLabel} ref={listRef} onKeyDown={onKeyDown}>{children}</div>;
}

function Tab({ value, children, badge, disabled = false }) {
  const { activeValue, select, getTabId, getPanelId } = useTabs("Tab");
  const selected = activeValue === value;
  return <button type="button" role="tab" id={getTabId(value)} aria-selected={selected}
    aria-controls={getPanelId(value)} tabIndex={selected ? 0 : -1} className="tab"
    data-value={value} disabled={disabled} onClick={() => select(value)}>
    {children}{badge != null && <span className="badge">{badge}</span>}
  </button>;
}

function TabPanel({ value, children }) {
  const { activeValue, getTabId, getPanelId } = useTabs("TabPanel");
  return <div className="panel" role="tabpanel" id={getPanelId(value)}
    aria-labelledby={getTabId(value)} tabIndex={0} hidden={activeValue !== value}>{children}</div>;
}

function TabIndicator() {
  const { activeValue, listRef } = useTabs("TabIndicator");
  const [style, setStyle] = useState({ transform: "translateX(0px)", width: 0 });
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const tab = list.querySelector('[role="tab"][aria-selected="true"]');
      if (tab) setStyle({ transform: `translateX(${tab.offsetLeft}px)`, width: tab.offsetWidth });
    };
    update();
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(list);
    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [activeValue, listRef]);
  return <span className="indicator" style={style} aria-hidden="true" />;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([
    { id: 1, title: "Review the project brief", done: true },
    { id: 2, title: "Prepare the accessibility checklist", done: false },
    { id: 3, title: "Share the component preview", done: false },
  ]);
  const taskInputRef = useRef(null);
  const [contributors, setContributors] = useState([
    { id: 1, name: "Ayesha Khan", email: "ayesha@example.com", role: "Owner", initials: "AK" },
    { id: 2, name: "Omar Ali", email: "omar@example.com", role: "Editor", initials: "OA" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [activities, setActivities] = useState([
    { id: 1, type: "task", text: "Ayesha completed “Set up workspace”", time: "10 min ago" },
    { id: 2, type: "member", text: "Omar joined as an editor", time: "1 hour ago" },
    { id: 3, type: "settings", text: "Workspace preferences were updated", time: "Yesterday" },
  ]);
  const [activityFilter, setActivityFilter] = useState("all");
  const [workspaceName, setWorkspaceName] = useState("Project workspace");
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const logActivity = (type, text) => {
    setActivities((current) => [{ id: Date.now(), type, text, time: "Just now" }, ...current]);
  };

  const addTask = (event) => {
    event.preventDefault();
    const input = taskInputRef.current;
    const title = input?.value.trim() ?? "";
    if (!title) {
      input?.focus();
      return;
    }
    setTasks((current) => [...current, { id: crypto.randomUUID?.() ?? Date.now(), title, done: false }]);
    input.value = "";
    input.focus();
    logActivity("task", `Task added: “${title}”`);
  };

  const toggleTask = (id) => {
    const task = tasks.find((item) => item.id === id);
    setTasks((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
    logActivity("task", `${task?.done ? "Reopened" : "Completed"}: “${task?.title}”`);
  };

  const deleteTask = (id) => {
    const task = tasks.find((item) => item.id === id);
    setTasks((current) => current.filter((item) => item.id !== id));
    logActivity("task", `Deleted task: “${task?.title}”`);
  };

  const inviteContributor = (event) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    setContributors((current) => [...current, { id: Date.now(), name, email, role: "Invited", initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2) }]);
    setInviteEmail("");
    logActivity("member", `Invitation sent to ${email}`);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setSaved(true);
    logActivity("settings", "Workspace preferences were saved");
    window.setTimeout(() => setSaved(false), 2500);
  };

  const visibleActivities = activityFilter === "all" ? activities : activities.filter((item) => item.type === activityFilter);
  const remainingTasks = tasks.filter((task) => !task.done).length;

  return <main className={`wrap ${compactMode ? "compact" : ""}`}>
    <div className="eyebrow">Interactive workspace</div>
    <h1>{workspaceName || "Untitled workspace"}</h1>
    <div className="intro-row">
      <p className="sub">Manage work, people, updates, and preferences from reusable tabs.</p>
      <p className="selection-status" aria-live="polite">Selected: <strong>{activeTab}</strong></p>
    </div>

    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabList ariaLabel="Workspace sections"><TabIndicator />
        <Tab value="tasks" badge={remainingTasks}>Tasks</Tab>
        <Tab value="contributions" badge={contributors.length}>Contributions</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>

      <TabPanel value="tasks">
        <div className="panel-heading"><div><h2>Tasks</h2><p>{remainingTasks} remaining · {tasks.length} total</p></div></div>
        <form className="inline-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">New task</label>
          <input id="new-task" ref={taskInputRef} name="taskTitle" autoComplete="off" placeholder="Add a new task…" />
          <button className="primary-button" type="submit">Add task</button>
        </form>
        <ul className="item-list task-list">
          {tasks.map((task) => <li key={task.id}>
            <label className={task.done ? "is-done" : ""}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span>{task.title}</span></label>
            <button className="icon-button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
          </li>)}
          {tasks.length === 0 && <li className="empty-state">No tasks yet. Add your first task above.</li>}
        </ul>
      </TabPanel>

      <TabPanel value="contributions">
        <div className="panel-heading"><div><h2>Contributions</h2><p>Invite collaborators and view their access.</p></div></div>
        <form className="inline-form" onSubmit={inviteContributor}>
          <label className="sr-only" htmlFor="invite-email">Contributor email</label>
          <input id="invite-email" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@example.com" />
          <button className="primary-button" type="submit" disabled={!inviteEmail.trim()}>Send invite</button>
        </form>
        <ul className="item-list contributor-list">
          {contributors.map((person) => <li key={person.id}><span className="avatar" aria-hidden="true">{person.initials}</span><span className="person"><strong>{person.name}</strong><small>{person.email}</small></span><span className={`role ${person.role === "Invited" ? "pending" : ""}`}>{person.role}</span></li>)}
        </ul>
      </TabPanel>

      <TabPanel value="activity">
        <div className="panel-heading activity-heading"><div><h2>Activity</h2><p>A live history of workspace changes.</p></div><label>Show <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}><option value="all">All activity</option><option value="task">Tasks</option><option value="member">Members</option><option value="settings">Settings</option></select></label></div>
        <ul className="item-list activity-list" aria-live="polite">
          {visibleActivities.map((item) => <li key={item.id}><span className={`activity-dot ${item.type}`} aria-hidden="true" /><span><strong>{item.text}</strong><small>{item.time}</small></span></li>)}
          {visibleActivities.length === 0 && <li className="empty-state">No activity matches this filter.</li>}
        </ul>
      </TabPanel>

      <TabPanel value="settings">
        <div className="panel-heading"><div><h2>Settings</h2><p>Update workspace display and notification preferences.</p></div></div>
        <form className="settings-form" onSubmit={saveSettings}>
          <label className="field">Workspace name<input value={workspaceName} onChange={(event) => { setWorkspaceName(event.target.value); setSaved(false); }} /></label>
          <label className="switch-row"><span><strong>Email notifications</strong><small>Receive a summary when workspace activity changes.</small></span><input type="checkbox" checked={notifications} onChange={(event) => { setNotifications(event.target.checked); setSaved(false); }} /></label>
          <label className="switch-row"><span><strong>Compact task list</strong><small>Reduce spacing to show more tasks at once.</small></span><input type="checkbox" checked={compactMode} onChange={(event) => { setCompactMode(event.target.checked); setSaved(false); }} /></label>
          <div className="save-row"><button className="primary-button" type="submit">Save settings</button><span className="save-message" role="status">{saved ? "? Changes saved" : ""}</span></div>
        </form>
      </TabPanel>
    </Tabs>
  </main>;
}

export { Tabs, TabList, Tab, TabPanel, TabIndicator };




