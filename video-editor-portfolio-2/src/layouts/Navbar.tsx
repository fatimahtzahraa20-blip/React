import { AnimatePresence, motion } from "framer-motion";
import {
  Film,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/#portfolio" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const isDark = theme === "dark";
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#portfolio") {
      const timer = window.setTimeout(() => {
        document.getElementById("portfolio")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [location.pathname, location.hash]);

  const handlePortfolioClick = () => {
    setMenuOpen(false);

    if (location.pathname === "/") {
      document.getElementById("portfolio")?.scrollIntoView({
        behavior: "smooth",
      });

      return;
    }

    navigate("/#portfolio");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setMenuOpen(false);

    await signOut();

    setLoggingOut(false);
    navigate("/login", { replace: true });
  };

  const dashboardPath = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Admin Panel" : "Dashboard";

  const secondaryButtonClass = `text-sm font-medium transition-colors duration-300 ${
    isDark
      ? "text-zinc-400 hover:text-white"
      : "text-zinc-600 hover:text-black"
  }`;

  const primaryButtonClass = `rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
    isDark
      ? "bg-white text-black hover:bg-zinc-200"
      : "bg-black text-white hover:bg-zinc-800"
  }`;

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full border-b transition-colors duration-300 ${
        scrolled
          ? isDark
            ? "border-white/10 bg-black/90 backdrop-blur-xl"
            : "border-black/10 bg-white/90 backdrop-blur-xl"
          : isDark
            ? "border-transparent bg-black/20"
            : "border-transparent bg-white/20"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${
              isDark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            <Film size={22} />
          </div>

          <div>
            <p
              className={`font-bold leading-none transition-colors duration-300 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Video Editor
            </p>

            <p
              className={`mt-1 text-xs transition-colors duration-300 ${
                isDark ? "text-zinc-500" : "text-zinc-600"
              }`}
            >
              Creative Portfolio
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            if (link.path === "/#portfolio") {
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={handlePortfolioClick}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isDark
                      ? "text-zinc-400 hover:text-white"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  {link.label}
                </button>
              );
            }

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? isDark
                        ? "text-white"
                        : "text-black"
                      : isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-600 hover:text-black"
                  }`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300 ${
              isDark
                ? "border-white/10 text-white hover:bg-white/10"
                : "border-black/10 text-black hover:bg-black/5"
            }`}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            title={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {!authLoading && !user && (
            <>
             <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 font-semibold transition hover:bg-[var(--soft)]">
                Login
              </Link>

              <Link to="/signup" className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 font-semibold transition hover:bg-[var(--soft)]">
                Sign Up
              </Link>
            </>
          )}

          {!authLoading && user && (
            <>
              <Link to={dashboardPath} className={secondaryButtonClass}>
                {dashboardLabel}
              </Link>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className={primaryButtonClass}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300 ${
              isDark
                ? "border-white/10 text-white hover:bg-white/10"
                : "border-black/10 text-black hover:bg-black/5"
            }`}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            title={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen((previous) => !previous);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300 ${
              isDark
                ? "border-white/10 text-white hover:bg-white/10"
                : "border-black/10 text-black hover:bg-black/5"
            }`}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`overflow-hidden border-t transition-colors duration-300 md:hidden ${
              isDark
                ? "border-white/10 bg-black"
                : "border-black/10 bg-white"
            }`}
          >
            <nav className="flex flex-col gap-2 px-4 py-5">
              {navLinks.map((link) => {
                if (link.path === "/#portfolio") {
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={handlePortfolioClick}
                      className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${
                        isDark
                          ? "text-zinc-300 hover:bg-white/10 hover:text-white"
                          : "text-zinc-700 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? isDark
                            ? "bg-white text-black"
                            : "bg-black text-white"
                          : isDark
                            ? "text-zinc-300 hover:bg-white/10 hover:text-white"
                            : "text-zinc-700 hover:bg-black/5 hover:text-black"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              {!authLoading && !user && (
                <>
                  <Link
                    to="/login"
                    className={`mt-2 rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors duration-300 ${
                      isDark
                        ? "border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                        : "border-black/10 text-zinc-700 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className={`mt-2 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors duration-300 ${
                      isDark
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    <UserPlus size={17} />
                    Sign Up
                  </Link>
                </>
              )}

              {!authLoading && user && (
                <>
                  <Link
                    to={dashboardPath}
                    className={`mt-2 rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors duration-300 ${
                      isDark
                        ? "border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                        : "border-black/10 text-zinc-700 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {dashboardLabel}
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={loggingOut}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors duration-300 ${
                      isDark
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              )}

              <Link
                to="/contact"
                className={`mt-3 rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors duration-300 ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                Start a Project
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
