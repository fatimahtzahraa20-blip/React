// A deliberately simplified collaboration engine for a text editor "prototype".
// It models the core hard problem collaborative editors solve — reconciling
// concurrent edits from multiple sources against a shared document — using a
// version-stamped operation log rather than a full OT/CRDT implementation.
// Swapping this for Yjs/Automerge/ShareDB would preserve the same public
// surface (`subscribe`, `applyLocalEdit`, `resolveConflict`).

const PEERS = [
  { id: "p-lena", name: "Lena", color: "#f97316" },
  { id: "p-omar", name: "Omar", color: "#22d3ee" },
];

const SNIPPETS = [
  "Let's add a section on rollout strategy.\n",
  "TODO: fill in the metrics table.\n",
  "Draft: ",
  "revised for clarity",
  " (pending review)",
  "\n\n## Open questions\n- ",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Computes a minimal single-region diff between two strings assuming a
 * single contiguous edit (true for normal typing). Good enough for this
 * prototype's op generation; a production CRDT wouldn't need this at all
 * since every keystroke is captured as a native operation.
 */
export function diffToOp(oldText, newText) {
  if (oldText === newText) return null;
  let start = 0;
  const maxStart = Math.min(oldText.length, newText.length);
  while (start < maxStart && oldText[start] === newText[start]) start++;

  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldText[oldEnd - 1] === newText[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  const deletedLen = oldEnd - start;
  const insertedText = newText.slice(start, newEnd);

  if (deletedLen > 0 && insertedText.length > 0) {
    return { type: "replace", pos: start, deleteLen: deletedLen, text: insertedText };
  }
  if (deletedLen > 0) {
    return { type: "delete", pos: start, deleteLen };
  }
  return { type: "insert", pos: start, text: insertedText };
}

function applyOp(text, op) {
  if (op.type === "insert") {
    return text.slice(0, op.pos) + op.text + text.slice(op.pos);
  }
  if (op.type === "delete") {
    return text.slice(0, op.pos) + text.slice(op.pos + op.deleteLen);
  }
  if (op.type === "replace") {
    return text.slice(0, op.pos) + op.text + text.slice(op.pos + op.deleteLen);
  }
  return text;
}

/** Shift an op's position to account for another op that landed before it (basic transform). */
function transformOp(op, against) {
  const shift =
    against.type === "delete"
      ? -against.deleteLen
      : against.type === "insert"
      ? against.text.length
      : against.text.length - against.deleteLen;

  if (against.pos <= op.pos) {
    return { ...op, pos: Math.max(against.pos, op.pos + shift) };
  }
  return op;
}

export class CollabDocEngine extends EventTarget {
  constructor(initialText) {
    super();
    this.serverText = initialText;
    this.serverVersion = 0;
    this.opLog = [];
    this.presence = new Map();
    PEERS.forEach((p) => this.presence.set(p.id, { ...p, cursor: 0 }));
    this._scheduleRemoteEdits();
    this._scheduleCursorMoves();
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  _scheduleRemoteEdits() {
    clearTimeout(this._remoteTimer);
    this._remoteTimer = setTimeout(() => {
      const peer = randomFrom(PEERS);
      const snippet = randomFrom(SNIPPETS);
      const pos = Math.min(this.serverText.length, Math.floor(Math.random() * (this.serverText.length + 1)));
      const op = { type: "insert", pos, text: snippet, authorId: peer.id };
      this._applyServerOp(op);
      this._scheduleRemoteEdits();
    }, 4000 + Math.random() * 6000);
  }

  _scheduleCursorMoves() {
    clearTimeout(this._cursorTimer);
    this._cursorTimer = setTimeout(() => {
      PEERS.forEach((p) => {
        const cursor = Math.floor(Math.random() * (this.serverText.length + 1));
        this.presence.set(p.id, { ...this.presence.get(p.id), cursor });
      });
      this._emit("presence", { presence: Array.from(this.presence.values()) });
      this._scheduleCursorMoves();
    }, 2500 + Math.random() * 2500);
  }

  _applyServerOp(op) {
    this.serverText = applyOp(this.serverText, op);
    this.serverVersion += 1;
    this.opLog.push({ ...op, version: this.serverVersion });
    this._emit("remote-op", {
      op,
      serverText: this.serverText,
      serverVersion: this.serverVersion,
    });
  }

  /**
   * Client submits a local edit based on the text it had at `baseVersion`.
   * If newer ops landed on the server since then, we transform the local op
   * against them. If transform confidence is low (edits overlap the same
   * region), we surface a conflict instead of silently guessing.
   */
  submitEdit({ op, baseVersion }) {
    const opsSince = this.opLog.filter((o) => o.version > baseVersion);

    const overlapsConcurrentEdit = opsSince.some((remoteOp) => {
      const opEnd = op.pos + (op.deleteLen || 0);
      const remoteEnd = remoteOp.pos + (remoteOp.deleteLen || 0);
      return op.pos < remoteEnd && remoteOp.pos < opEnd && op.deleteLen > 0;
    });

    if (overlapsConcurrentEdit) {
      return {
        ok: false,
        conflict: true,
        serverText: this.serverText,
        serverVersion: this.serverVersion,
      };
    }

    let transformed = op;
    for (const remoteOp of opsSince) {
      transformed = transformOp(transformed, remoteOp);
    }

    this.serverText = applyOp(this.serverText, transformed);
    this.serverVersion += 1;
    this.opLog.push({ ...transformed, version: this.serverVersion, authorId: "me" });

    return { ok: true, serverText: this.serverText, serverVersion: this.serverVersion };
  }

  getPresence() {
    return Array.from(this.presence.values());
  }

  close() {
    clearTimeout(this._remoteTimer);
    clearTimeout(this._cursorTimer);
  }
}
