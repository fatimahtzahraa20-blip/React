import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-400">Administration</p>
            <h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-3 text-zinc-400">
              Manage your portfolio content from here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-fit rounded-lg border border-white/10 px-5 py-2.5 text-sm transition hover:bg-white hover:text-black"
          >
            Logout
          </button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Link
            to="/dashboard/videos"
            className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-white/40"
          >
            <h2 className="text-xl font-semibold">Manage Videos</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Add, edit, view and delete portfolio videos.
            </p>
          </Link>

          <Link
            to="/dashboard/messages"
            className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-white/40"
          >
            <h2 className="text-xl font-semibold">Messages</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              View messages received through the contact form.
            </p>
          </Link>

          <Link
            to="/dashboard/settings"
            className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-white/40"
          >
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Update portfolio name, text, email and social links.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}