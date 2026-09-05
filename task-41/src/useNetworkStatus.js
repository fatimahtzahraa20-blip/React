import { useEffect, useState, useRef } from "react";

/**
 * useNetworkStatus: combines the browser's `online`/`offline` events with an
 * active heartbeat "ping" (simulated here) to detect not just binary
 * connectivity but also degraded/slow connections — since `navigator.onLine`
 * alone only tells you the OS thinks there's *a* network interface, not that
 * it actually reaches the internet.
 */
export function useNetworkStatus({ pingIntervalMs = 5000 } = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState("good"); // good | slow | unknown
  const [lastPingMs, setLastPingMs] = useState(null);
  const [history, setHistory] = useState([]);
  const pingTimerRef = useRef(null);

  function logEvent(label) {
    setHistory((h) =>
      [{ id: `${Date.now()}-${Math.random()}`, label, ts: Date.now() }, ...h].slice(0, 12)
    );
  }

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      logEvent("Browser reported: online");
    }
    function handleOffline() {
      setIsOnline(false);
      setConnectionQuality("unknown");
      logEvent("Browser reported: offline");
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Active heartbeat: simulates pinging a lightweight endpoint to measure
  // real reachability/latency rather than trusting navigator.onLine alone.
  useEffect(() => {
    function ping() {
      if (!navigator.onLine) return;
      const start = performance.now();
      const simulatedLatency = 40 + Math.random() * 260;
      const willTimeout = Math.random() < 0.06;

      setTimeout(() => {
        if (willTimeout) {
          setConnectionQuality("slow");
          setLastPingMs(null);
          logEvent("Heartbeat timed out — connection may be degraded");
          return;
        }
        const elapsed = Math.round(performance.now() - start);
        setLastPingMs(elapsed);
        setConnectionQuality(elapsed > 200 ? "slow" : "good");
      }, simulatedLatency);
    }

    ping();
    pingTimerRef.current = setInterval(ping, pingIntervalMs);
    return () => clearInterval(pingTimerRef.current);
  }, [pingIntervalMs]);

  return { isOnline, connectionQuality, lastPingMs, history };
}
