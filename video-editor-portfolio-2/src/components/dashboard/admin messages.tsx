import { useEffect, useMemo, useState } from "react";

import supabase from "../../lib/supabase";

type ContactMessage = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");

    const { data, error: messagesError } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (messagesError) {
      setError(messagesError.message);
      setMessages([]);
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (filter === "all") {
      return messages;
    }

    if (filter === "unread") {
      return messages.filter((message) => !message.is_read);
    }

    return messages.filter((message) => message.is_read);
  }, [filter, messages]);

  const totals = useMemo(() => {
    const unread = messages.filter((message) => !message.is_read).length;

    return {
      total: messages.length,
      unread,
      read: messages.length - unread,
    };
  }, [messages]);

  const markAsRead = async (message: ContactMessage) => {
    if (message.is_read) {
      setSelectedMessage(message);
      return;
    }

    setUpdatingId(message.id);
    setError("");
    setSuccessMessage("");

    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", message.id);

    setUpdatingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const updatedMessage = {
      ...message,
      is_read: true,
    };

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? updatedMessage : item
      )
    );

    setSelectedMessage(updatedMessage);
  };

  const toggleReadStatus = async (message: ContactMessage) => {
    const nextValue = !message.is_read;

    setUpdatingId(message.id);
    setError("");
    setSuccessMessage("");

    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ is_read: nextValue })
      .eq("id", message.id);

    setUpdatingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              is_read: nextValue,
            }
          : item
      )
    );

    if (selectedMessage?.id === message.id) {
      setSelectedMessage({
        ...message,
        is_read: nextValue,
      });
    }

    setSuccessMessage(
      nextValue
        ? "Message marked as read."
        : "Message marked as unread."
    );
  };

  const deleteMessage = async (message: ContactMessage) => {
    const confirmed = window.confirm(
      `Delete the message from ${message.name || message.email || "this sender"}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(message.id);
    setError("");
    setSuccessMessage("");

    const { error: deleteError } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", message.id);

    setUpdatingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessages((current) =>
      current.filter((item) => item.id !== message.id)
    );

    if (selectedMessage?.id === message.id) {
      setSelectedMessage(null);
    }

    setSuccessMessage("Message deleted successfully.");
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Admin Panel
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contact Messages</h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Read and manage messages submitted through your portfolio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadMessages()}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
            >
              {loading ? "Refreshing..." : "Refresh Messages"}
            </button>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Messages
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.total}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Unread
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.unread}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("read")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Read
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.read}</p>
          </button>
        </section>

        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold capitalize">
                  {filter === "all" ? "All Messages" : `${filter} Messages`}
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {filteredMessages.length} message
                  {filteredMessages.length === 1 ? "" : "s"} found.
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "all" | "unread" | "read")
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="all">All messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {loading ? (
              <p className="py-16 text-center text-zinc-500">
                Loading messages...
              </p>
            ) : filteredMessages.length === 0 ? (
              <p className="py-16 text-center text-zinc-500">
                No messages found.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredMessages.map((message) => {
                  const isUpdating = updatingId === message.id;

                  return (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => void markAsRead(message)}
                      disabled={isUpdating}
                      className={`w-full px-5 py-4 text-left transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-zinc-950 ${
                        selectedMessage?.id === message.id
                          ? "bg-zinc-50 dark:bg-zinc-950"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!message.is_read && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                            )}

                            <p className="truncate font-semibold">
                              {message.name || "Unknown sender"}
                            </p>
                          </div>

                          <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                            {message.email || "No email"}
                          </p>

                          <p className="mt-2 truncate text-sm font-medium">
                            {message.subject || "No subject"}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
                            {message.message || "No message content"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {!selectedMessage ? (
              <div className="flex min-h-[360px] items-center justify-center text-center">
                <div>
                  <h2 className="text-xl font-bold">Select a message</h2>

                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a message from the list to read its full content.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedMessage.subject || "No subject"}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      selectedMessage.is_read
                        ? "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                  >
                    {selectedMessage.is_read ? "Read" : "Unread"}
                  </span>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">From</p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                      {selectedMessage.name || "Unknown sender"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Email</p>
                    <a
                      href={`mailto:${selectedMessage.email || ""}`}
                      className="mt-1 inline-flex break-all text-red-600 hover:text-red-700"
                    >
                      {selectedMessage.email || "No email"}
                    </a>
                  </div>

                  <div>
                    <p className="font-semibold">Message</p>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-600 dark:text-zinc-300">
                      {selectedMessage.message || "No message content"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void toggleReadStatus(selectedMessage)}
                    disabled={updatingId === selectedMessage.id}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                  >
                    {selectedMessage.is_read
                      ? "Mark as Unread"
                      : "Mark as Read"}
                  </button>

                  {selectedMessage.email && (
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject || "Your message"
                      )}`}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Reply by Email
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => void deleteMessage(selectedMessage)}
                    disabled={updatingId === selectedMessage.id}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}