import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "../../lib/constants";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-amber-400"
        >
          Portfolio
        </NavLink>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-amber-400"
                  : "text-gray-300 transition hover:text-amber-400"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Login Button */}
        <NavLink
          to="/login"
          className="hidden rounded-lg bg-amber-400 px-5 py-2 font-semibold text-black transition hover:bg-amber-500 md:block"
        >
          Admin
        </NavLink>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="border-t border-zinc-800 bg-black md:hidden">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-6 py-4 ${
                  isActive
                    ? "text-amber-400"
                    : "text-gray-300 hover:text-amber-400"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <NavLink
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-4 font-semibold text-amber-400"
          >
            Admin Login
          </NavLink>
        </nav>
      )}
    </header>
  );
}