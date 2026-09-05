import { useEffect, useMemo, useState } from "react";
import supabase from "../../lib/supabase";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const PAGE_SIZE = 8;

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data ?? []) as Message[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return messages.filter(m => {
      const okSearch = !s || m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.subject.toLowerCase().includes(s);
      const okFilter = filter === "all" || (filter === "read" && m.is_read) || (filter === "unread" && !m.is_read);
      return okSearch && okFilter;
    });
  }, [messages, search, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function toggleRead(msg: Message) {
    await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    setMessages(cur => cur.map(x => x.id === msg.id ? { ...x, is_read: !x.is_read } : x));
  }

  async function remove(id: number) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(cur => cur.filter(x => x.id !== id));
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Contact Messages</h1>

        <div className="grid md:grid-cols-[1fr_180px] gap-4 mb-6">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-blue-500" 
          />
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {loading ? (
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  {/* Added dark:text-zinc-200 to headers */}
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Name</th>
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Email</th>
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Subject</th>
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Status</th>
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Date</th>
                  <th className="p-3 text-left text-zinc-900 dark:text-zinc-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map(m => (
                  <tr key={m.id} className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    {/* Added dark:text-zinc-300 to table cells */}
                    <td className="p-3 text-zinc-800 dark:text-zinc-300">{m.name}</td>
                    <td className="p-3 text-zinc-800 dark:text-zinc-300">{m.email}</td>
                    <td className="p-3 text-zinc-800 dark:text-zinc-300">{m.subject}</td>
                    <td className="p-3 text-zinc-800 dark:text-zinc-300">{m.is_read ? "Read" : "Unread"}</td>
                    <td className="p-3 text-zinc-800 dark:text-zinc-300">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="p-3 space-x-2">
                      {/* Added dark mode colors to buttons */}
                      <button 
                        onClick={() => void toggleRead(m)} 
                        className="px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        {m.is_read ? "Unread" : "Read"}
                      </button>
                      <button 
                        onClick={() => void remove(m.id)} 
                        className="px-3 py-1 border border-red-300 dark:border-red-900 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          {/* Added dark mode colors to pagination */}
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-zinc-800 dark:text-zinc-200">Page {page} / {pages}</span>
          <button 
            onClick={() => setPage(p => Math.min(pages, p + 1))} 
            disabled={page === pages}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}