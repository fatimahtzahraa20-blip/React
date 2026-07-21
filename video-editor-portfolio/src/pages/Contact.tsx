import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

import ContactForm from "../components/forms/ContactForm";
import { sendContactMessage } from "../services/contact.service";

import type { ContactFormValues } from "../schemas/contact.schema";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      setLoading(true);
      setError("");

      await sendContactMessage(values);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your message.";

      setError(message);

      throw submitError;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            Contact
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            Let&apos;s create something amazing
          </h1>

          <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
            Share your video editing project, requirements, timeline, and
            creative vision. I will get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8"
          >
            <h2 className="text-2xl font-semibold">
              Contact Information
            </h2>

            <p className="mt-3 leading-7 text-zinc-400">
              Reach out directly or use the contact form to discuss your next
              project.
            </p>

            <div className="mt-8 space-y-5">
              <a
                href="mailto:your-email@example.com"
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-black p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <div className="rounded-lg bg-white/10 p-3">
                  <Mail size={20} />
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="mt-1 text-zinc-200">
                    your-email@example.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+920000000000"
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-black p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <div className="rounded-lg bg-white/10 p-3">
                  <Phone size={20} />
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Phone</p>
                  <p className="mt-1 text-zinc-200">
                    +92 000 0000000
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-black p-4">
                <div className="rounded-lg bg-white/10 p-3">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="text-sm text-zinc-500">Location</p>
                  <p className="mt-1 text-zinc-200">
                    Pakistan
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <ContactForm
              loading={loading}
              onSubmit={handleSubmit}
            />
          </motion.section>
        </div>
      </div>
    </main>
  );
}