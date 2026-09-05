import { useState } from "react";
import { useFetch, clearCache, getCacheSnapshot, fetcherFor } from "./useFetch.js";

function UsersWidget({ instanceLabel }) {
  const { data, error, isLoading, isValidating, isStale, refetch } = useFetch(
    "/api/users",
    fetcherFor("/api/users")
  );

  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Users widget ({instanceLabel})</h3>
        <span className={`pill ${isStale ? "stale" : "fresh"}`}>{isStale ? "stale" : "fresh"}</span>
      </div>

      {isLoading && (
        <>
          <div className="skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </>
      )}

      {error && !data && <div className="error-box">Failed to load: {error.message}</div>}

      {data && (
        <div className="entity-grid">
          {data.map((u) => (
            <div className="entity-card" key={u.id}>
              <div className="name">{u.name}</div>
              <div className="sub">{u.role}</div>
            </div>
          ))}
        </div>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={refetch} disabled={isValidating}>
          {isValidating ? "Revalidating…" : "Refetch"}
        </button>
        {isValidating && data && <span className="stat-inline">Showing cached data while revalidating…</span>}
      </div>
    </div>
  );
}

function ProfileWidget() {
  const { data, error, isLoading, refetch, isValidating } = useFetch(
    "/api/profile",
    fetcherFor("/api/profile"),
    { staleTime: 4000 }
  );

  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Profile widget</h3>
        <span className="pill fresh">staleTime: 4s</span>
      </div>
      {isLoading && <div className="skeleton-line" style={{ width: "60%" }} />}
      {error && !data && <div className="error-box">Failed to load profile: {error.message}</div>}
      {data && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          {data.name} · Plan: {data.plan}
        </p>
      )}
      <button className="btn secondary" onClick={refetch} disabled={isValidating}>
        Refetch
      </button>
    </div>
  );
}

function CacheInspector() {
  const [, setTick] = useState(0);
  const snapshot = getCacheSnapshot();

  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Cache inspector</h3>
        <button className="btn secondary" onClick={() => { clearCache(); setTick((n) => n + 1); }}>
          Clear all cache
        </button>
      </div>
      {snapshot.length === 0 && <div className="stat-inline">Cache is empty. Fetch something above.</div>}
      <div className="log-list">
        {snapshot.map((s) => (
          <div className="log-row" key={s.key}>
            <span><code>{s.key}</code></span>
            <span className="meta">
              {s.hasError ? "error" : "ok"} · {Math.round(s.age / 1000)}s old
            </span>
          </div>
        ))}
      </div>
      <button className="btn secondary" style={{ marginTop: 10 }} onClick={() => setTick((n) => n + 1)}>
        Refresh inspector
      </button>
    </div>
  );
}

export default function App() {
  const [showSecondInstance, setShowSecondInstance] = useState(true);

  return (
    <div className="wrap">
      <h1>🪝 Reusable Data-Fetching Hook</h1>
      <p className="desc">
        <code>useFetch(key, fetcher, options)</code> (see <code>src/useFetch.js</code>) provides shared caching,
        request de-duplication, loading/error state, and stale-while-revalidate — the two "Users widget" instances
        below share one underlying cache entry and request.
      </p>

      <UsersWidget instanceLabel="A" />
      <label className="row" style={{ marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>
        <input type="checkbox" checked={showSecondInstance} onChange={(e) => setShowSecondInstance(e.target.checked)} />
        &nbsp;Mount second instance (shares cache + in-flight request)
      </label>
      {showSecondInstance && <UsersWidget instanceLabel="B" />}

      <ProfileWidget />
      <CacheInspector />
    </div>
  );
}
