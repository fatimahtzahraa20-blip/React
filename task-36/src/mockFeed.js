// Simulates a server-sent-events / websocket feed of activity events,
// including connection drops so we can build real reconnection UX.

const ACTORS = ["Amina", "Ben", "Carlos", "Priya", "Wei", "Sofia"];
const ACTIONS = [
  { type: "comment", icon: "💬", verb: "commented on" },
  { type: "like", icon: "❤️", verb: "liked" },
  { type: "follow", icon: "➕", verb: "started following" },
  { type: "upload", icon: "📎", verb: "uploaded a file to" },
  { type: "mention", icon: "📣", verb: "mentioned you in" },
];
const TARGETS = ["Q3 Roadmap", "Design Review", "Sprint Board", "Onboarding Doc", "Marketing Plan"];

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function randomEvent() {
  const actor = ACTORS[Math.floor(Math.random() * ACTORS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
  return {
    id: randomId(),
    actor,
    type: action.type,
    icon: action.icon,
    verb: action.verb,
    target,
    ts: Date.now(),
  };
}

export class MockActivityFeed extends EventTarget {
  constructor() {
    super();
    this.status = "connecting";
    this._connect();
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  _connect() {
    this.status = "connecting";
    this._emit("status", { status: "connecting" });
    clearTimeout(this._connTimer);
    this._connTimer = setTimeout(() => {
      this.status = "online";
      this._emit("status", { status: "online" });
      this._scheduleEvents();
      this._scheduleDrop();
    }, 500 + Math.random() * 500);
  }

  _scheduleEvents() {
    clearTimeout(this._eventTimer);
    const next = 1500 + Math.random() * 3000;
    this._eventTimer = setTimeout(() => {
      if (this.status === "online") {
        this._emit("event", randomEvent());
        this._scheduleEvents();
      }
    }, next);
  }

  _scheduleDrop() {
    clearTimeout(this._dropTimer);
    this._dropTimer = setTimeout(() => {
      if (this.status !== "online") return;
      this.status = "offline";
      this._emit("status", { status: "offline" });
      clearTimeout(this._eventTimer);
      setTimeout(() => this._connect(), 2000 + Math.random() * 2000);
    }, 25000 + Math.random() * 20000);
  }

  /** Simulates fetching an older page of historical events (for "load more"). */
  fetchHistoryPage(page = 1) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = Array.from({ length: 8 }, () => ({
          ...randomEvent(),
          ts: Date.now() - page * 1000 * 60 * (20 + Math.random() * 40),
        }));
        resolve(items);
      }, 500 + Math.random() * 500);
    });
  }

  close() {
    clearTimeout(this._connTimer);
    clearTimeout(this._eventTimer);
    clearTimeout(this._dropTimer);
  }
}
