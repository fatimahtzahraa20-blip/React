import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MockChatSocket } from "./mockSocket.js";

const ME = { id: "u-me", name: "You" };

const ROOMS = [
  { id: "general", name: "# general" },
  { id: "engineering", name: "# engineering" },
  { id: "random", name: "# random" },
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * useChatSocket: encapsulates connection lifecycle + optimistic send/retry
 * so the room switch doesn't have to think about transport details.
 */
function useChatRoom(roomId) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    const socket = new MockChatSocket({ roomId });
    socketRef.current = socket;
    setStatus("connecting");
    setMessages([]);
    setTypingUsers({});

    const onStatus = (e) => setStatus(e.detail.status);
    const onMessage = (e) =>
      setMessages((prev) => [...prev, { ...e.detail, kind: "incoming" }]);
    const onTyping = (e) =>
      setTypingUsers((prev) => ({ ...prev, [e.detail.userId]: e.detail.name }));
    const onTypingStop = (e) =>
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[e.detail.userId];
        return next;
      });

    socket.addEventListener("status", onStatus);
    socket.addEventListener("message", onMessage);
    socket.addEventListener("typing", onTyping);
    socket.addEventListener("typing-stop", onTypingStop);

    return () => {
      socket.removeEventListener("status", onStatus);
      socket.removeEventListener("message", onMessage);
      socket.removeEventListener("typing", onTyping);
      socket.removeEventListener("typing-stop", onTypingStop);
      socket.close();
    };
  }, [roomId]);

  const sendMessage = useCallback((text) => {
    const socket = socketRef.current;
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMsg = {
      id: localId,
      userId: ME.id,
      name: ME.name,
      text,
      ts: Date.now(),
      kind: "outgoing",
      status: "pending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    socket
      .send({ id: localId, userId: ME.id, name: ME.name, text })
      .then((ack) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: "sent", ts: ack.ts } : m))
        );
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: "failed" } : m))
        );
      });
  }, []);

  const retryMessage = useCallback((localId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === localId ? { ...m, status: "pending" } : m))
    );
    const msg = messages.find((m) => m.id === localId);
    if (!msg || !socketRef.current) return;
    socketRef.current
      .send({ id: localId, userId: ME.id, name: ME.name, text: msg.text })
      .then((ack) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: "sent", ts: ack.ts } : m))
        );
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: "failed" } : m))
        );
      });
  }, [messages]);

  return { status, messages, typingUsers, sendMessage, retryMessage };
}

export default function App() {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0].id);
  const { status, messages, typingUsers, sendMessage, retryMessage } = useChatRoom(activeRoom);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingUsers]);

  const typingNames = useMemo(() => Object.values(typingUsers), [typingUsers]);

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || status !== "online") return;
    sendMessage(text);
    setDraft("");
  }

  const statusLabel = {
    online: "Connected",
    connecting: "Connecting...",
    offline: "Reconnecting...",
  }[status];

  return (
    <div className="app">
      <aside className="sidebar">
        <h1><span className="pak-logo" aria-hidden="true">PK</span> Pak Chat</h1>
        {ROOMS.map((room) => (
          <div
            key={room.id}
            className={`room ${activeRoom === room.id ? "active" : ""}`}
            onClick={() => setActiveRoom(room.id)}
          >
            <span>{room.name}</span>
          </div>
        ))}
        <div className="connection-banner">
          <span className={`status-dot ${status}`} />
          {statusLabel}
        </div>
      </aside>

      <main className="chat">
        <header className="chat-header">
          <div>
            <h2>{ROOMS.find((r) => r.id === activeRoom)?.name}</h2>
            <div className="sub">{messages.length} messages</div>
          </div>
        </header>

        <div className="messages" ref={scrollerRef}>
          {messages.map((m) => {
            const mine = m.userId === ME.id;
            return (
              <div key={m.id} className={`msg-row ${mine ? "mine" : ""}`}>
                <div className="avatar" title={m.name}>{initials(m.name)}</div>
                <div>
                  <div className="bubble">{m.text}</div>
                  <div className="msg-meta">
                    <span>{mine ? "" : m.name + " · "}{timeStr(m.ts)}</span>
                    {mine && m.status === "pending" && <span className="status-pending">Sending...</span>}
                    {mine && m.status === "sent" && <span className="status-sent">&#10003; Sent</span>}
                    {mine && m.status === "failed" && (
                      <span className="status-failed" onClick={() => retryMessage(m.id)}>
                        Failed · Retry
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="typing-indicator">
          {typingNames.length > 0 &&
            `${typingNames.join(", ")} ${typingNames.length > 1 ? "are" : "is"} typing...`}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={status === "online" ? "Apna paighaam likhein..." : "Connection ka intezar..."}
            disabled={status !== "online"}
          />
          <button type="submit" disabled={status !== "online" || !draft.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}




