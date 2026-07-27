import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Checking your account...
        </p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    const result = await signIn({ email, password });

    setSubmitting(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-24 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Video Portfolio Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Sign In
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Sign in to manage your personal portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength={6}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
          This login is reserved for the portfolio owner.
        </p>
      </section>
    </main>
  );
}

