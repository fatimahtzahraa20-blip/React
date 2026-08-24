import { useEffect, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus.js";

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function App() {
  const { isOnline, connectionQuality, lastPingMs, history } = useNetworkStatus({ pingIntervalMs: 4000 });
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMode, setBannerMode] = useState("offline"); // offline | reconnecting | online
  const [queuedActions, setQueuedActions] = useState(0);

  // Drive a top banner: show immediately on offline, show a brief
  // "back online" confirmation, then auto-hide.
  useEffect(() => {
    if (!isOnline) {
      setBannerMode("offline");
      setBannerVisible(true);
    } else if (bannerVisible && bannerMode === "offline") {
      setBannerMode("online");
      const t = setTimeout(() => setBannerVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  function simulateAction() {
    if (!isOnline) {
      setQueuedActions((n) => n + 1);
    }
  }

  const statusLabel = !isOnline ? "Offline" : connectionQuality === "slow" ? "Slow connection" : "Online";
  const dotClass = !isOnline ? "offline" : connectionQuality === "slow" ? "slow" : "online";

  return (
    <div className="wrap">
      <div className={`status-banner ${bannerVisible ? "visible" : ""} ${bannerMode}`}>
        {bannerMode === "offline" && "⚠️ You're offline — some features may be unavailable"}
        {bannerMode === "online" && "✅ You're back online"}
      </div>

      <h1>📶 Network Status Indicator</h1>
      <p className="desc">
        Combines the browser's native <code>online</code>/<code>offline</code> events with a simulated periodic
        heartbeat ping to detect degraded connections, not just a binary online/offline state.
      </p>

      <div className="card">
        <div className="big-status">
          <span className={`status-dot-big ${dotClass}`} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{statusLabel}</div>
            <div className="stat-inline">
              {isOnline
                ? lastPingMs != null
                  ? `Last heartbeat: ${lastPingMs}ms`
                  : "Heartbeat pending…"
                : "Waiting for connection to return"}
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <div className="label">navigator.onLine</div>
            <div className="value">{isOnline ? "true" : "false"}</div>
          </div>
          <div className="detail-card">
            <div className="label">Connection quality</div>
            <div className="value" style={{ textTransform: "capitalize" }}>{connectionQuality}</div>
          </div>
          <div className="detail-card">
            <div className="label">Queued actions</div>
            <div className="value">{queuedActions}</div>
          </div>
        </div>
      </div>

      {!isOnline && queuedActions > 0 && (
        <div className="queued-banner">
          {queuedActions} action{queuedActions > 1 ? "s" : ""} queued locally — will sync once you're back online.
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Try an action</h3>
          <button className="btn" onClick={simulateAction}>
            {isOnline ? "Perform action (goes live)" : "Perform action (will queue)"}
          </button>
        </div>
        <p className="stat-inline" style={{ margin: 0 }}>
          To test offline behavior, disconnect Wi-Fi or use your browser DevTools' Network tab to throttle to
          "Offline."
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Event log</h3>
        {history.length === 0 && <div className="stat-inline">No events yet.</div>}
        <div className="log-list">
          {history.map((h) => (
            <div className="log-row" key={h.id}>
              <span>{h.label}</span>
              <span className="meta">{timeStr(h.ts)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
