import { AnimatePresence, motion } from "framer-motion";
import { Film, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

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

  const location = useLocation();
  const navigate = useNavigate();

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
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#portfolio") {
      setTimeout(() => {
        document.getElementById("portfolio")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
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

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full border-b transition ${
        scrolled
          ? "border-white/10 bg-black/90 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
            <Film size={22} />
          </div>

          <div>
            <p className="font-bold leading-none text-white">Video Editor</p>
            <p className="mt-1 text-xs text-zinc-500">Creative Portfolio</p>
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
                  className="text-sm font-medium text-zinc-400 transition hover:text-white"
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
                  `text-sm font-medium transition ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* ✅ Desktop: Admin Link + Start a Project Button */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Admin
          </Link>
          <Link
            to="/contact"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Start a Project
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-black md:hidden"
          >
            <nav className="flex flex-col gap-2 px-4 py-5">
              {navLinks.map((link) => {
                if (link.path === "/#portfolio") {
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={handlePortfolioClick}
                      className="rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
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
                      `rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-white text-black"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              {/* ✅ Mobile: Admin Link */}
              <Link
                to="/login"
                className="mt-2 rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Admin Login
              </Link>

              <Link
                to="/contact"
                className="mt-3 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-black transition hover:bg-zinc-200"
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