import { useState } from "react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    name: "Ali Khan",
    email: "ali@example.com",
    subject: "Video editing project",
    message: "I need an editor for my YouTube channel.",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara@example.com",
    subject: "Social media videos",
    message: "I want short promotional videos for Instagram.",
  },
];

export default function DashboardMessages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleDelete = (id: number) => {
    setMessages((previous: Message[]) =>
      previous.filter((message) => message.id !== id)
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  return (
    <section className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Messages</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Back
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/10 p-10 text-center text-zinc-400">
            No messages available.
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-xl border border-white/10 bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{message.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {message.email}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {message.subject}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(message)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Read
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(message.id)}
                      className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedMessage && (
          <div className="mt-8 rounded-xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedMessage.subject}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  From: {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="mt-5 leading-7 text-zinc-300">
              {selectedMessage.message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}