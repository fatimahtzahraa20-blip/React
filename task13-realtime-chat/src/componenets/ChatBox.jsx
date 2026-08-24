import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const addMessageOnce = (messages, incomingMessage) =>
  messages.some((message) => message.id === incomingMessage.id)
    ? messages
    : [...messages, incomingMessage];

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState(() => localStorage.getItem("chat-sender") || "");
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(isSupabaseConfigured ? "Connecting..." : "Setup required");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let isMounted = true;

    const loadMessages = async () => {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("id, text, sender, created_at")
        .order("created_at", { ascending: true });
      if (!isMounted) return;
      if (fetchError) setError("Could not load messages. Check your Supabase table and policies.");
      else setMessages(data ?? []);
      setIsLoading(false);
    };
    loadMessages();

    const channel = supabase
      .channel("messages-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((current) => addMessageOnce(current, payload.new));
      })
      .subscribe((connectionStatus) => {
        if (!isMounted) return;
        if (connectionStatus === "SUBSCRIBED") {
          setStatus("Live");
          setError("");
        } else if (connectionStatus === "CHANNEL_ERROR" || connectionStatus === "TIMED_OUT") {
          setStatus("Offline");
          setError("Live updates are temporarily unavailable. Retrying automatically.");
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateSender = (event) => {
    const value = event.target.value;
    setSender(value);
    localStorage.setItem("chat-sender", value);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = newMessage.trim();
    if (!text || isSending || !isSupabaseConfigured) return;

    setIsSending(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({ text, sender: sender.trim() || "Anonymous" })
      .select("id, text, sender, created_at")
      .single();

    if (insertError) setError("Message not sent: " + insertError.message);
    else {
      setMessages((current) => addMessageOnce(current, data));
      setNewMessage("");
    }
    setIsSending(false);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div>
          <p className="eyebrow">REALTIME ROOM</p>
          <h1>Live Chat</h1>
        </div>
        <span className={`connection-status ${status === "Live" ? "is-live" : ""}`}><i /> {status}</span>
      </header>
      <div className="messages">
        {isLoading && <p className="empty-state">Loading messages...</p>}
        {!isLoading && !isSupabaseConfigured && <p className="empty-state">Add Supabase credentials to <code>.env</code> to start chatting.</p>}
        {!isLoading && isSupabaseConfigured && messages.length === 0 && <p className="empty-state">No messages yet. Be the first to say hello.</p>}
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <strong>{message.sender || "Anonymous"}</strong>
            <p>{message.text}</p>
            <span>{new Date(message.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="chat-error" role="alert">{error}</p>}
      <form onSubmit={sendMessage} className="message-form">
        <input className="sender-input" type="text" placeholder="Name (e.g. Browser 1)" value={sender} onChange={updateSender} disabled={!isSupabaseConfigured || isSending} maxLength="40" aria-label="Your display name" />
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(event) => setNewMessage(event.target.value)} disabled={!isSupabaseConfigured || isSending} maxLength="500" aria-label="New message" />
        <button type="submit" disabled={!newMessage.trim() || !isSupabaseConfigured || isSending}>{isSending ? "Sending..." : "Send"}</button>
      </form>
    </div>
  );
}

export default ChatBox;