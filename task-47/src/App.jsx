import { useEffect, useState, useCallback } from "react";
import { addSubmission, updateSubmission, removeSubmission, getAllSubmissions } from "./db.js";
import { submitToServer } from "./mockSubmitApi.js";

function randomId() {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "" });
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const effectiveOnline = isOnline && !simulateOffline;

  const refreshQueue = useCallback(() => {
    getAllSubmissions().then(setQueue);
  }, []);

  useEffect(() => {
    refreshQueue();
    function onOnline() { setIsOnline(true); }
    function onOffline() { setIsOnline(false); }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshQueue]);

  const syncQueue = useCallback(async () => {
    if (!effectiveOnline || syncing) return;
    setSyncing(true);
    const pending = await getAllSubmissions();
    for (const item of pending.filter((i) => i.status !== "synced")) {
      await updateSubmission(item.id, { status: "syncing" });
      refreshQueue();
      try {
        await submitToServer(item);
        await removeSubmission(item.id);
      } catch (err) {
        await updateSubmission(item.id, { status: "error", lastError: err.message, retryCount: (item.retryCount || 0) + 1 });
      }
      refreshQueue();
    }
    setSyncing(false);
  }, [effectiveOnline, syncing, refreshQueue]);

  // Auto-sync whenever we come back online.
  useEffect(() => {
    if (effectiveOnline) syncQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOnline]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const entry = {
      id: randomId(),
      title: form.title,
      notes: form.notes,
      createdAt: Date.now(),
      status: "pending",
      retryCount: 0,
    };
    await addSubmission(entry);
    setForm({ title: "", notes: "" });
    refreshQueue();
    if (effectiveOnline) syncQueue();
  }

  async function retryOne(id) {
    await updateSubmission(id, { status: "pending" });
    refreshQueue();
    syncQueue();
  }

  return (
    <div className="wrap">
      <h1>📴 Offline-First Form</h1>
      <p className="desc">
        Submissions are written to <b>IndexedDB</b> first (see <code>src/db.js</code>), so nothing is lost even if
        you're offline or the app closes. A background sync process drains the queue whenever you're online.
      </p>

      <div className="card row between">
        <span className={`pill ${effectiveOnline ? "ok" : "err"}`}>
          {effectiveOnline ? "🟢 Online" : "🔴 Offline"}
        </span>
        <label className="row" style={{ fontSize: 13, color: "var(--muted)" }}>
          <input
            type="checkbox"
            checked={simulateOffline}
            onChange={(e) => setSimulateOffline(e.target.checked)}
          />
          &nbsp;Simulate offline (form still works — try it!)
        </label>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3>New entry</h3>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            style={{ width: "100%" }}
          />
        </div>
        <button className="btn primary" type="submit">
          {effectiveOnline ? "Submit" : "Save offline"}
        </button>
      </form>

      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}>Sync queue ({queue.length})</h3>
          <button className="btn secondary" onClick={syncQueue} disabled={!effectiveOnline || syncing}>
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        </div>
        {queue.length === 0 && <div className="stat-inline">Nothing queued — all synced.</div>}
        <div className="log-list">
          {queue.map((item) => (
            <div className="log-row" key={item.id} style={{ alignItems: "center" }}>
              <span>
                <b>{item.title}</b>
                {item.notes && <span className="meta"> — {item.notes}</span>}
              </span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`pill ${item.status === "error" ? "err" : item.status === "syncing" ? "pending" : "stale"}`}>
                  {item.status}
                </span>
                {item.status === "error" && (
                  <button className="btn secondary" style={{ padding: "4px 10px" }} onClick={() => retryOne(item.id)}>
                    Retry
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
