import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await signUp({
      fullName,
      email,
      password,
    });

    setLoading(false);
    setMessage(result.message);

    if (result.success) {
      setFullName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2 text-black dark:text-white">
              Full Name
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3 bg-transparent"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-black dark:text-white">
              Email
            </label>

            <input
              type="email"
              className="w-full border rounded-lg px-4 py-3 bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-black dark:text-white">
              Password
            </label>

            <input
              type="password"
              className="w-full border rounded-lg px-4 py-3 bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

        {message && (
          <p className="mt-5 text-center text-green-600">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-black dark:text-white">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-600 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}