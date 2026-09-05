import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import supabase from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "Password reset email sent. Please check your inbox and open the reset link."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-24 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Account Recovery
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Forgot Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Enter your account email and we will send you a secure password
            reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="forgot-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}