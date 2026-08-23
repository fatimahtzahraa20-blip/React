import { useEffect, useRef, useState, useCallback } from "react";
import { CollabDocEngine, diffToOp } from "./collabEngine.js";

const INITIAL_DOC = `# Product Launch Notes

Write here — this document simulates two other collaborators (Lena and Omar)
editing concurrently. Try typing while their edits land to see live merge
and conflict handling in action.
`;

const HISTORY_LIMIT = 8;

export default function App() {
  const engineRef = useRef(null);
  const [text, setText] = useState(INITIAL_DOC);
  const [version, setVersion] = useState(0);
  const [presence, setPresence] = useState([]);
  const [history, setHistory] = useState([]);
  const [syncState, setSyncState] = useState("synced"); // synced | syncing | conflict
  const [conflictSnapshot, setConflictSnapshot] = useState(null);
  const baselineRef = useRef(INITIAL_DOC); // text as of last known-synced version
  const debounceRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const engine = new CollabDocEngine(INITIAL_DOC);
    engineRef.current = engine;
    setPresence(engine.getPresence());

    const onRemoteOp = (e) => {
      const { op, serverText, serverVersion } = e.detail;
      setSyncState((prevSync) => {
        // If we currently have no unsynced local changes, just take the update.
        return prevSync;
      });
      setText((current) => {
        if (current === baselineRef.current) {
          baselineRef.current = serverText;
          setVersion(serverVersion);
          return serverText;
        }
        // We have local unsynced edits; keep showing local text, but the
        // server has moved on — next submit will transform/detect conflicts.
        return current;
      });
      setHistory((h) =>
        [
          {
            id: `${serverVersion}-${Math.random()}`,
            author: op.authorId === "me" ? "You" : engine.presence.get(op.authorId)?.name || "Peer",
            summary: summarizeOp(op),
            version: serverVersion,
          },
          ...h,
        ].slice(0, HISTORY_LIMIT)
      );
    };

    const onPresence = (e) => setPresence(e.detail.presence);

    engine.addEventListener("remote-op", onRemoteOp);
    engine.addEventListener("presence", onPresence);

    return () => {
      engine.removeEventListener("remote-op", onRemoteOp);
      engine.removeEventListener("presence", onPresence);
      engine.close();
    };
  }, []);

  const flushLocalEdit = useCallback((newText) => {
    const engine = engineRef.current;
    if (!engine) return;
    const op = diffToOp(baselineRef.current, newText);
    if (!op) return;

    setSyncState("syncing");
    setTimeout(() => {
      const result = engine.submitEdit({ op, baseVersion: version });
      if (result.ok) {
        baselineRef.current = result.serverText;
        setVersion(result.serverVersion);
        setSyncState("synced");
        setHistory((h) =>
          [
            { id: `${result.serverVersion}-me`, author: "You", summary: summarizeOp(op), version: result.serverVersion },
            ...h,
          ].slice(0, HISTORY_LIMIT)
        );
      } else if (result.conflict) {
        setSyncState("conflict");
        setConflictSnapshot({ serverText: result.serverText, myText: newText });
      }
    }, 350 + Math.random() * 300);
  }, [version]);

  function handleChange(e) {
    const newText = e.target.value;
    setText(newText);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flushLocalEdit(newText), 500);
  }

  function resolveKeepMine() {
    const engine = engineRef.current;
    baselineRef.current = engine.serverText; // accept server as new baseline
    engine.serverText = text;
    engine.serverVersion += 1;
    setVersion(engine.serverVersion);
    baselineRef.current = text;
    setSyncState("synced");
    setConflictSnapshot(null);
  }

  function resolveTakeTheirs() {
    const engine = engineRef.current;
    setText(engine.serverText);
    baselineRef.current = engine.serverText;
    setVersion(engine.serverVersion);
    setSyncState("synced");
    setConflictSnapshot(null);
  }

  return (
    <div className="editor-app">
      <div className="topbar">
        <h1>📝 Collaborative Doc</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="presence-row">
            {presence.map((p) => (
              <div
                key={p.id}
                className="presence-avatar"
                style={{ background: p.color }}
                title={`${p.name} — editing`}
              >
                {p.name[0]}
              </div>
            ))}
          </div>
          <div className="sync-pill">
            <span className={`sync-dot ${syncState}`} />
            {syncState === "synced" && "Synced"}
            {syncState === "syncing" && "Syncing…"}
            {syncState === "conflict" && "Conflict"}
          </div>
        </div>
      </div>

      {syncState === "conflict" && conflictSnapshot && (
        <div className="conflict-banner">
          <span>Someone edited the same region while you were typing. Keep your version or take theirs?</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resolveKeepMine}>Keep mine</button>
            <button onClick={resolveTakeTheirs} style={{ background: "#374151" }}>
              Take theirs
            </button>
          </div>
        </div>
      )}

      <div className="editor-surface">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={text}
          onChange={handleChange}
          spellCheck={false}
        />
      </div>
      <div className="hint">
        Version {version} · Edits sync ~500ms after you stop typing, simulating debounced network sync.
      </div>

      <div className="history-panel">
        <h3>Change history</h3>
        {history.length === 0 && <div className="history-row">No changes yet.</div>}
        {history.map((h) => (
          <div className="history-row" key={h.id}>
            <span><b>{h.author}</b> {h.summary}</span>
            <span>v{h.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function summarizeOp(op) {
  if (op.type === "insert") return `inserted ${op.text.length} char${op.text.length === 1 ? "" : "s"}`;
  if (op.type === "delete") return `deleted ${op.deleteLen} char${op.deleteLen === 1 ? "" : "s"}`;
  if (op.type === "replace") return `replaced ${op.deleteLen} chars with ${op.text.length}`;
  return "edited";
}
