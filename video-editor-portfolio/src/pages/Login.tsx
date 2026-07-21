import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold">Admin Login</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Sign in to manage your portfolio.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white/40"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
}