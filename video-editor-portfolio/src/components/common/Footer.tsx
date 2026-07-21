import { Globe, MessageCircle, Play, Send } from "lucide-react";
import {
  APP_NAME,
  CONTACT_INFO,
  FOOTER_TEXT,
  SOCIAL_LINKS,
} from "../../lib/constants";

export default function Footer() {
  const icons = {
    GitHub: <Globe size={20} />,
    LinkedIn: <Send size={20} />,
    Instagram: <MessageCircle size={20} />,
    YouTube: <Play size={20} />,
  };

  return (
    <footer className="mt-20 border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Portfolio Info */}
          <div>
            <h2 className="text-2xl font-bold text-amber-400">
              {APP_NAME}
            </h2>

            <p className="mt-3 text-gray-400">
              Professional Video Editor creating cinematic,
              engaging and creative content.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact
            </h3>

            <p className="text-gray-400">
              {CONTACT_INFO.email}
            </p>

            <p className="mt-2 text-gray-400">
              {CONTACT_INFO.phone}
            </p>

            <p className="mt-2 text-gray-400">
              {CONTACT_INFO.location}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Follow Me
            </h3>

            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-zinc-900 p-3 text-gray-300 transition hover:bg-amber-400 hover:text-black"
                >
                  {
                    icons[
                      social.name as keyof typeof icons
                    ]
                  }
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-sm text-gray-500">
          {FOOTER_TEXT}
        </div>

      </div>
    </footer>
  );
}