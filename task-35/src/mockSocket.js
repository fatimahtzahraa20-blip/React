const ROOM_MEMBERS = {
  general: { "Ayesha Khan": "u-ayesha", "Hamza Ali": "u-hamza" },
  engineering: { "Saad Dev": "u-saad", "Maham Raza": "u-maham" },
  random: { "Bilal Ahmed": "u-bilal", "Zoya Khan": "u-zoya" },
};

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class MockChatSocket extends EventTarget {
  constructor({ roomId = "general" } = {}) {
    super();
    this.roomId = roomId;
    this.status = "connecting";
    this.history = [];
    this.closed = false;

    setTimeout(() => {
      if (this.closed) return;
      this.status = "online";
      this._emit("status", { status: "online" });
    }, 350);
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  async _generateReply() {
    const members = ROOM_MEMBERS[this.roomId] || ROOM_MEMBERS.general;
    const pendingNames = Object.keys(members);
    const typingName = pendingNames[Math.floor(Math.random() * pendingNames.length)];
    const typingId = members[typingName];
    this._emit("typing", { userId: typingId, name: typingName });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: this.roomId, messages: this.history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI reply unavailable");
      if (this.closed) return;

      this._emit("typing-stop", { userId: typingId });
      const userId = members[data.speaker] || typingId;

      if (userId !== typingId) {
        this._emit("typing", { userId, name: data.speaker });
        await new Promise((resolve) => setTimeout(resolve, 500));
        this._emit("typing-stop", { userId });
      }

      this.history.push({ role: "assistant", name: data.speaker, text: data.text });
      this._emit("message", {
        id: randomId(),
        userId,
        name: data.speaker,
        text: data.text,
        ts: Date.now(),
      });
    } catch (error) {
      this._emit("typing-stop", { userId: typingId });
      if (this.closed) return;
      this._emit("message", {
        id: randomId(),
        userId: "u-system",
        name: "Pak Chat",
        text: error.message.includes("credits")
          ? "AI replies are paused because API credits have finished."
          : "AI reply is unavailable right now. Please try again later.",
        ts: Date.now(),
      });
    }
  }

  send(message) {
    if (this.status !== "online") return Promise.reject(new Error("not-connected"));

    this.history.push({ role: "user", name: "You", text: message.text });
    const ack = { ...message, ts: Date.now() };

    // Message delivery and AI generation are separate operations.
    // The user's message stays sent even if the AI service is unavailable.
    this._generateReply();
    return Promise.resolve(ack);
  }

  close() {
    this.closed = true;
  }
}
