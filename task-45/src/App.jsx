import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COMMANDS = [
  { id: "new-file", group: "Create", icon: "📄", label: "Create a new file", shortcut: "⌘N" },
  { id: "new-folder", group: "Create", icon: "📁", label: "Create a new folder", shortcut: "⌘⇧N" },
  { id: "save", group: "Actions", icon: "💾", label: "Save workspace", shortcut: "⌘S" },
  { id: "search", group: "Actions", icon: "🔍", label: "Open files and search", shortcut: "⌘K" },
  { id: "go-dashboard", group: "Navigate", icon: "🏠", label: "Go to Dashboard" },
  { id: "go-files", group: "Navigate", icon: "🗂️", label: "Go to Files" },
  { id: "go-settings", group: "Navigate", icon: "⚙️", label: "Go to Settings" },
  { id: "go-profile", group: "Navigate", icon: "👤", label: "Go to Profile" },
  { id: "theme-dark", group: "Preferences", icon: "🌙", label: "Switch to dark theme" },
  { id: "theme-light", group: "Preferences", icon: "☀️", label: "Switch to light theme" },
  { id: "logout", group: "Account", icon: "🚪", label: "Log out" },
];

const INITIAL_ITEMS = [
  { id: 1, name: "Projects", type: "folder", detail: "3 items" },
  { id: 2, name: "Documents", type: "folder", detail: "5 items" },
  { id: 3, name: "README.md", type: "file", detail: "2 KB" },
  { id: 4, name: "notes.txt", type: "file", detail: "1 KB" },
];

function CommandMenu({ onClose, onRun }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const previouslyFocused = useRef(null);

  const filtered = useMemo(
    () => COMMANDS.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const grouped = useMemo(() => {
    return filtered.reduce((groups, command) => {
      (groups[command.group] ||= []).push(command);
      return groups;
    }, {});
  }, [filtered]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    inputRef.current?.focus();
    return () => previouslyFocused.current?.focus?.();
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const run = useCallback((command) => {
    onRun(command);
    onClose();
  }, [onClose, onRun]);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) run(filtered[activeIndex]);
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  }

  let flatIndex = -1;

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="command-menu" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-input-row">
          <span className="icon" aria-hidden="true">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
            aria-autocomplete="list"
          />
          <span className="esc-hint">Esc to close</span>
        </div>

        <div className="command-list" role="listbox" id="command-listbox" ref={listRef} aria-label="Commands">
          {!filtered.length && <div className="command-empty" role="status">No commands match “{query}”</div>}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="command-group-label">{group}</div>
              {items.map((command) => {
                flatIndex += 1;
                const itemIndex = flatIndex;
                const active = itemIndex === activeIndex;
                return (
                  <div
                    key={command.id}
                    id={`cmd-${command.id}`}
                    role="option"
                    aria-selected={active}
                    className="command-item"
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => run(command)}
                  >
                    <span className="left"><span className="icon" aria-hidden="true">{command.icon}</span>{command.label}</span>
                    {command.shortcut && <span className="shortcut">{command.shortcut}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("command-theme") || "dark");
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("command-items")) || INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileQuery, setFileQuery] = useState("");
  const [toast, setToast] = useState("");
  const [loggedIn, setLoggedIn] = useState(true);
  const triggerRef = useRef(null);

  const showToast = useCallback((message) => setToast(message), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("command-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (modifier && event.key.toLowerCase() === "s") {
        event.preventDefault();
        localStorage.setItem("command-items", JSON.stringify(items));
        showToast("Workspace saved");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, showToast]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(fileQuery.toLowerCase())),
    [fileQuery, items]
  );

  function createItem(type) {
    const sameTypeCount = items.filter((item) => item.type === type).length + 1;
    const item = {
      id: Date.now(),
      type,
      name: type === "folder" ? `New Folder ${sameTypeCount}` : `untitled-${sameTypeCount}.txt`,
      detail: type === "folder" ? "Empty folder" : "0 KB",
    };
    setItems((current) => [item, ...current]);
    setView("files");
    setSelectedItem(item);
    showToast(`${type === "folder" ? "Folder" : "File"} created`);
  }

  function runCommand(command) {
    const actions = {
      "new-file": () => createItem("file"),
      "new-folder": () => createItem("folder"),
      save: () => {
        localStorage.setItem("command-items", JSON.stringify(items));
        showToast("Workspace saved");
      },
      search: () => {
        setView("files");
        setSelectedItem(null);
        showToast("Files opened");
      },
      "go-dashboard": () => setView("dashboard"),
      "go-files": () => setView("files"),
      "go-settings": () => setView("settings"),
      "go-profile": () => setView("profile"),
      "theme-dark": () => {
        setTheme("dark");
        showToast("Dark theme enabled");
      },
      "theme-light": () => {
        setTheme("light");
        showToast("Light theme enabled");
      },
      logout: () => {
        setLoggedIn(false);
        showToast("You have been logged out");
      },
    };
    actions[command.id]?.();
  }

  function openItem(item) {
    setSelectedItem(item);
    showToast(item.type === "folder" ? `Opened ${item.name}` : `Opened ${item.name} in editor`);
  }

  if (!loggedIn) {
    return (
      <main className="logged-out">
        <div className="auth-card">
          <span className="auth-icon">👋</span>
          <h1>You’re signed out</h1>
          <p>Your local workspace is safe. Sign in to continue.</p>
          <button className="primary-btn" onClick={() => { setLoggedIn(true); setView("dashboard"); }}>Sign back in</button>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>⌘</span> Command Palette</div>
        <nav aria-label="Main navigation">
          {[
            ["dashboard", "🏠", "Dashboard"],
            ["files", "🗂️", "Files"],
            ["profile", "👤", "Profile"],
            ["settings", "⚙️", "Settings"],
          ].map(([id, icon, label]) => (
            <button key={id} className={view === id ? "nav-item active" : "nav-item"} onClick={() => { setView(id); setSelectedItem(null); }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <button className="nav-item logout" onClick={() => runCommand({ id: "logout" })}><span>🚪</span>Log out</button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>{view[0].toUpperCase() + view.slice(1)}</h1>
          </div>
          <button ref={triggerRef} className="trigger-btn" onClick={() => setOpen(true)}>
            <span>🔍</span> Search commands <kbd>⌘K</kbd>
          </button>
        </header>

        {view === "dashboard" && (
          <section>
            <div className="hero">
              <div><span className="eyebrow">QUICK START</span><h2>What would you like to do?</h2><p>Every command now performs a real action in this workspace.</p></div>
              <button className="primary-btn" onClick={() => setOpen(true)}>Open command palette</button>
            </div>
            <div className="stats">
              <article><span>📄</span><strong>{items.filter((item) => item.type === "file").length}</strong><p>Files</p></article>
              <article><span>📁</span><strong>{items.filter((item) => item.type === "folder").length}</strong><p>Folders</p></article>
              <article><span>⚡</span><strong>{COMMANDS.length}</strong><p>Commands</p></article>
            </div>
            <h2 className="section-title">Quick actions</h2>
            <div className="quick-grid">
              <button onClick={() => createItem("file")}><span>📄</span><b>New file</b><small>Create a text document</small></button>
              <button onClick={() => createItem("folder")}><span>📁</span><b>New folder</b><small>Organize your files</small></button>
              <button onClick={() => setView("files")}><span>🗂️</span><b>Browse files</b><small>Open your workspace</small></button>
            </div>
          </section>
        )}

        {view === "files" && (
          <section className="files-view">
            <div className="toolbar">
              <div className="file-search"><span>🔍</span><input value={fileQuery} onChange={(event) => setFileQuery(event.target.value)} placeholder="Search files and folders…" /></div>
              <button onClick={() => createItem("file")}>＋ New file</button>
              <button onClick={() => createItem("folder")}>＋ New folder</button>
            </div>
            {selectedItem ? (
              <div className="item-preview">
                <button className="back-btn" onClick={() => setSelectedItem(null)}>← Back to all files</button>
                <div className="preview-icon">{selectedItem.type === "folder" ? "📁" : "📄"}</div>
                <h2>{selectedItem.name}</h2>
                <p>{selectedItem.type === "folder" ? "This folder is ready for files. Use New file to add content to your workspace." : "This is a working file preview. Your file is ready to edit in the full application."}</p>
                <span className="pill">{selectedItem.detail}</span>
              </div>
            ) : (
              <div className="file-list">
                <div className="file-row file-head"><span>Name</span><span>Type</span><span>Size</span></div>
                {visibleItems.map((item) => (
                  <button className="file-row" key={item.id} onClick={() => openItem(item)}>
                    <span className="file-name"><span>{item.type === "folder" ? "📁" : "📄"}</span>{item.name}</span>
                    <span>{item.type}</span><span>{item.detail}</span>
                  </button>
                ))}
                {!visibleItems.length && <div className="empty-files">No files or folders found.</div>}
              </div>
            )}
          </section>
        )}

        {view === "profile" && (
          <section className="panel profile-card">
            <div className="avatar">AL</div><div><span className="eyebrow">ACCOUNT</span><h2>Alex Lee</h2><p>alex@example.com</p></div>
            <button className="secondary-btn" onClick={() => showToast("Profile changes saved")}>Save profile</button>
          </section>
        )}

        {view === "settings" && (
          <section className="panel settings-panel">
            <span className="eyebrow">APPEARANCE</span><h2>Workspace settings</h2><p>Choose the theme that feels best to you.</p>
            <div className="theme-options">
              <button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}><span>🌙</span><b>Dark</b></button>
              <button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}><span>☀️</span><b>Light</b></button>
            </div>
          </section>
        )}
      </main>

      {open && <CommandMenu onClose={() => setOpen(false)} onRun={runCommand} />}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}