import { motion } from "framer-motion";
import { ArrowUp, Film, Mail, MapPin } from "lucide-react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/#portfolio" },
  { label: "Contact", path: "/contact" },
];

const serviceLinks = [
  "Video Editing",
  "Motion Graphics",
  "Color Grading",
  "YouTube Editing",
  "Social Media Videos",
];

const socialLinks = [
  { label: "Instagram", url: "https://instagram.com", icon: FaInstagram },
  { label: "YouTube", url: "https://youtube.com", icon: FaYoutube },
  { label: "LinkedIn", url: "https://linkedin.com", icon: FaLinkedin },
  { label: "Facebook", url: "https://facebook.com", icon: FaFacebook },
  { label: "GitHub", url: "https://github.com", icon: FaGithub },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const softText = isDark ? "text-zinc-500" : "text-zinc-500";
  const borderClass = isDark ? "border-white/10" : "border-black/10";
  const hoverTextClass = isDark
    ? "hover:text-white"
    : "hover:text-black";

  const handlePortfolioClick = () => {
    if (location.pathname === "/") {
      document
        .getElementById("portfolio")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/#portfolio");

    window.setTimeout(() => {
      document
        .getElementById("portfolio")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-zinc-950 text-white"
          : "border-black/10 bg-zinc-100 text-black"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Link to="/" className="inline-flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${
                  isDark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                <Film size={22} />
              </div>

              <div>
                <p className="font-bold leading-none">Video Editor</p>
                <p className={`mt-1 text-xs ${softText}`}>
                  Creative Portfolio
                </p>
              </div>
            </Link>

            <p className={`mt-5 max-w-sm text-sm leading-7 ${mutedText}`}>
              Professional video editing services focused on storytelling,
              visual quality, audience engagement, and polished digital
              content.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                      isDark
                        ? "border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white hover:text-black"
                        : "border-black/10 text-zinc-600 hover:border-black/20 hover:bg-black hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <h2 className="font-semibold">Quick Links</h2>

            <div className="mt-5 flex flex-col gap-3">
              {quickLinks.map((link) => {
                if (link.path === "/#portfolio") {
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={handlePortfolioClick}
                      className={`w-fit text-left text-sm transition ${mutedText} ${hoverTextClass}`}
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`w-fit text-sm transition ${mutedText} ${hoverTextClass}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            <h2 className="font-semibold">Services</h2>

            <div className="mt-5 flex flex-col gap-3">
              {serviceLinks.map((service) => (
                <Link
                  key={service}
                  to="/services"
                  className={`w-fit text-sm transition ${mutedText} ${hoverTextClass}`}
                >
                  {service}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <h2 className="font-semibold">Contact</h2>

            <div className="mt-5 space-y-4">
              <a
                href="mailto:fatimahtzahraa2.0@gmail.com"
                className={`flex items-start gap-3 text-sm transition ${mutedText} ${hoverTextClass}`}
              >
                <Mail size={18} className="mt-0.5 shrink-0" />
                <span className="break-all">
                  fatimahtzahraa2.0@gmail.com
                </span>
              </a>

              <div className={`flex items-start gap-3 text-sm ${mutedText}`}>
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>Pakistan</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div
          className={`mt-14 flex flex-col gap-5 border-t pt-7 sm:flex-row sm:items-center sm:justify-between ${borderClass}`}
        >
          <p className={`text-sm ${softText}`}>
            © {currentYear} Video Editor Portfolio. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              isDark
                ? "border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                : "border-black/10 text-zinc-600 hover:bg-black/5 hover:text-black"
            }`}
          >
            Back to top
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}