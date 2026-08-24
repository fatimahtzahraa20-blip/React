import { useEffect, useState, useCallback } from "react";

const SITE_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Documentation", path: "/docs" },
  { label: "Billing", path: "/billing" },
  { label: "Support", path: "/support" },
];

function generateErrorId() {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function HomePage({ navigate }) {
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-illustration">🏠</div>
        <div className="error-title">Welcome home</div>
        <p className="error-desc">
          This is the "real" app content. Use the buttons at the bottom of the page (or the nav links above) to
          simulate hitting a broken link (404) or a failing request (500).
        </p>
      </div>
    </div>
  );
}

function NotFoundPage({ navigate, attemptedPath }) {
  const [query, setQuery] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate("home");
  }

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-code">404</div>
        <div className="error-title">This page took a wrong turn</div>
        <p className="error-desc">
          We couldn't find <code>{attemptedPath}</code>. It may have been moved, renamed, or never existed. Let's
          get you back on track.
        </p>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search the site…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn primary" type="submit">Search</button>
        </form>

        <div className="error-actions">
          <button className="btn primary" onClick={() => navigate("home")}>Go to homepage</button>
          <button className="btn secondary" onClick={() => window.history.back()}>Go back</button>
        </div>

        <div className="helpful-links">
          <div className="label">Popular pages</div>
          {SITE_LINKS.map((l) => (
            <span key={l.path} onClick={() => navigate("home")} style={{ cursor: "pointer" }}>
              {l.label} — <span style={{ color: "var(--muted)" }}>{l.path}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServerErrorPage({ navigate }) {
  const [errorId] = useState(generateErrorId);
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [serviceStatus, setServiceStatus] = useState("checking"); // checking | degraded | operational

  useEffect(() => {
    const t = setTimeout(() => {
      setServiceStatus(Math.random() < 0.5 ? "degraded" : "operational");
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const retry = useCallback(() => {
    setRetrying(true);
    setAttempt((a) => a + 1);
    setTimeout(() => {
      setRetrying(false);
      // In a real app, this would re-issue the failed request. We simulate
      // it "succeeding" after a couple attempts for a satisfying demo.
      if (attempt >= 1) navigate("home");
    }, 1100);
  }, [attempt, navigate]);

  // Auto-retry with a visible countdown, capped at 3 attempts — avoids
  // hammering an already-struggling backend indefinitely.
  useEffect(() => {
    if (attempt >= 3 || retrying) return;
    setCountdown(8);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          retry();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function copyErrorId() {
    navigator.clipboard?.writeText(errorId);
  }

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-code err500">500</div>
        <div className="error-title">Something went wrong on our end</div>
        <p className="error-desc">
          This isn't your fault — our server hit an unexpected error handling your request. We've been notified
          automatically and are looking into it.
        </p>

        <div className="error-actions">
          <button className="btn primary" onClick={retry} disabled={retrying || attempt >= 3}>
            {retrying ? "Retrying…" : attempt >= 3 ? "Max retries reached" : "Try again"}
          </button>
          <button className="btn secondary" onClick={() => navigate("home")}>Back to homepage</button>
          <button className="btn secondary" onClick={() => navigate("support")}>Contact support</button>
        </div>

        {!retrying && attempt < 3 && countdown != null && (
          <div className="retry-countdown">Auto-retrying in {countdown}s… (attempt {attempt + 1} of 3)</div>
        )}
        {attempt >= 3 && (
          <div className="retry-countdown" style={{ color: "#ff9c9c" }}>
            We've tried a few times without luck — please contact support if this keeps happening.
          </div>
        )}

        <div className="status-panel">
          <div className="row">
            <span>Service status</span>
            <b style={{ color: serviceStatus === "operational" ? "#6ee7b8" : serviceStatus === "degraded" ? "#fcd34d" : "var(--muted)" }}>
              {serviceStatus === "checking" ? "Checking…" : serviceStatus === "operational" ? "● Operational" : "● Degraded performance"}
            </b>
          </div>
          <div className="row">
            <span>Retry attempts</span>
            <b>{attempt} / 3</b>
          </div>
        </div>

        <div className="error-id" onClick={copyErrorId} style={{ cursor: "pointer" }} title="Click to copy">
          Reference ID: {errorId} (click to copy — include this when contacting support)
        </div>
      </div>
    </div>
  );
}

function SupportPage({ navigate }) {
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-illustration">💬</div>
        <div className="error-title">Support</div>
        <p className="error-desc">This would be your real support/contact page.</p>
        <button className="btn primary" onClick={() => navigate("home")}>Back to homepage</button>
      </div>
    </div>
  );
}

const PAGES = {
  home: { Component: HomePage, path: "/" },
  notfound: { Component: NotFoundPage, path: "/this-page-does-not-exist" },
  servererror: { Component: ServerErrorPage, path: "/api/checkout" },
  support: { Component: SupportPage, path: "/support" },
};

export default function App() {
  const [page, setPage] = useState("home");

  function navigate(id) {
    setPage(id);
  }

  const { Component, path } = PAGES[page];

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <span className="brand">◆ Error</span>
        <div className="links">
          <span className={page === "home" ? "active" : ""} onClick={() => navigate("home")}>Home</span>
          <span className={page === "support" ? "active" : ""} onClick={() => navigate("support")}>Support</span>
        </div>
      </nav>

      <Component navigate={navigate} attemptedPath={path} />

      <div className="demo-trigger-bar">
        <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center", marginRight: 6 }}>
          Demo: simulate hitting →
        </span>
        {Object.entries(PAGES).map(([id]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}
