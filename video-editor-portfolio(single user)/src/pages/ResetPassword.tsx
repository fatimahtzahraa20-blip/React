import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import supabase from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      setCheckingSession(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setCheckingSession(false);
        return;
      }

      if (session) {
        setRecoveryReady(true);
        setCheckingSession(false);
        return;
      }

      /*
        Supabase recovery links can briefly need time to exchange the URL
        token for a session. Listen for the recovery event before showing
        an invalid-link message.
      */
      window.setTimeout(async () => {
        if (!mounted) {
          return;
        }

        const {
          data: { session: delayedSession },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setRecoveryReady(Boolean(delayedSession));

        if (!delayedSession) {
          setError(
            "This password reset link is invalid or has expired. Request a new reset link."
          );
        }

        setCheckingSession(false);
      }, 1000);
    };

    void checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setRecoveryReady(true);
        setCheckingSession(false);
        setError("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!recoveryReady) {
      setError(
        "The recovery session is not available. Please request a new reset link."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully. Redirecting to login...");

    await supabase.auth.signOut();

    window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Verifying your password reset link...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-24 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Account Recovery
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Reset Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Enter a new password for your account.
          </p>
        </div>

        {recoveryReady && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium"
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Enter new password"
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Enter password again"
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
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

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
          Need another reset link?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Request Again
          </Link>
        </p>
      </section>
    </main>
  );
}