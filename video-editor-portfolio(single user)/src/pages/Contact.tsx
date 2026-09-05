import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Send,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

type FormValues = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  message: "",
};

const projectTypes = [
  "YouTube Video",
  "Short-Form Content",
  "Motion Graphics",
  "Color Grading",
  "Commercial Video",
  "Other",
];

const budgetOptions = [
  "Less than $100",
  "$100 - $300",
  "$300 - $700",
  "$700+",
  "Let us discuss",
];

export default function Contact() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const pageClass = isDark ? "bg-black text-white" : "bg-white text-black";
  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const softText = isDark ? "text-zinc-500" : "text-zinc-500";
  const cardClass = isDark
    ? "border-white/10 bg-zinc-950"
    : "border-black/10 bg-zinc-100";
  const inputClass = isDark
    ? "border-white/10 bg-black text-white placeholder:text-zinc-600 focus:border-white/30"
    : "border-black/10 bg-white text-black placeholder:text-zinc-400 focus:border-black/30";

  const updateField = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formValues.name.trim()) {
      return "Please enter your name.";
    }

    if (!formValues.email.trim()) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formValues.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!formValues.projectType) {
      return "Please select a project type.";
    }

    if (!formValues.message.trim()) {
      return "Please describe your project.";
    }

    return "";
  };

  // Fixed: Correct event type and proper preventDefault usage
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { error } = await supabase.from("contact_messages").insert({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        project_type: formValues.projectType,
        budget: formValues.budget || null,
        message: formValues.message.trim(),
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Your message has been sent successfully. I will contact you soon."
      );
      setFormValues(initialValues);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${pageClass}`}>
      <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div
            className={`absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl ${
              isDark ? "bg-white/[0.04]" : "bg-black/[0.04]"
            }`}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              isDark
                ? "border-white/10 bg-white/5 text-zinc-300"
                : "border-black/10 bg-black/5 text-zinc-700"
            }`}
          >
            <MessageSquare size={16} />
            Contact
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
            Let us create something{" "}
            <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
              meaningful together.
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-3xl text-base leading-8 sm:text-lg ${mutedText}`}
          >
            Share your project idea, preferred editing style, deadline, and
            budget. I will review the details and respond with the next steps.
          </p>
        </motion.div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl border p-7 sm:p-8 ${cardClass}`}
          >
            <p className={`text-sm font-medium uppercase tracking-[0.25em] ${softText}`}>
              Contact Information
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Ready to discuss your project?
            </h2>

            <p className={`mt-4 leading-8 ${mutedText}`}>
              You can use the contact form or email me directly. Please include
              enough details so I can understand your project requirements.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="mailto:fatimahtzahraa2.0@gmail.com"
                className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                  isDark
                    ? "border-white/10 bg-black hover:border-white/20"
                    : "border-black/10 bg-white hover:border-black/20"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  <Mail size={20} />
                </div>

                <div>
                  <p className="font-semibold">Email</p>
                  <p className={`mt-1 break-all text-sm ${mutedText}`}>
                    fatimahtzahraa2.0@gmail.com
                  </p>
                </div>
              </a>

              <div
                className={`flex items-start gap-4 rounded-2xl border p-4 ${
                  isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="font-semibold">Location</p>
                  <p className={`mt-1 text-sm ${mutedText}`}>Pakistan</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-4 rounded-2xl border p-4 ${
                  isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  <Clock3 size={20} />
                </div>

                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    Usually within 24–48 hours
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`mt-8 rounded-2xl border p-5 ${
                isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
              }`}
            >
              <p className="font-semibold">Helpful project details</p>

              <ul className={`mt-4 space-y-3 text-sm ${mutedText}`}>
                {[
                  "Video type and platform",
                  "Approximate footage length",
                  "Preferred editing style",
                  "Deadline and budget",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl border p-7 sm:p-8 ${cardClass}`}
          >
            <p className={`text-sm font-medium uppercase tracking-[0.25em] ${softText}`}>
              Project Form
            </p>

            <h2 className="mt-4 text-3xl font-bold">Tell me about your idea</h2>

            <p className={`mt-4 leading-8 ${mutedText}`}>
              Complete the form below and provide a clear description of what
              you need.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Your Name
                  </span>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${inputClass}`}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Email Address
                  </span>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="Enter your email"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${inputClass}`}
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Project Type
                  </span>
                  <select
                    value={formValues.projectType}
                    onChange={(event) => updateField("projectType", event.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${inputClass}`}
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map((projectType) => (
                      <option key={projectType} value={projectType}>
                        {projectType}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Budget
                  </span>
                  <select
                    value={formValues.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${inputClass}`}
                  >
                    <option value="">Select budget range</option>
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Project Details
                </span>
                <textarea
                  rows={7}
                  value={formValues.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Describe your project, editing style, deadline, and other important details."
                  className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition ${inputClass}`}
                />
              </label>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

            <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-3xl border px-6 py-10 text-center sm:px-10 lg:flex-row lg:text-left ${cardClass}`}
        >
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Prefer to contact me directly?
            </h2>
            <p className={`mt-2 ${mutedText}`}>
              Send an email with your project details and reference examples.
            </p>
          </div>

          {/* ✅ PERFECTLY FIXED: Borderless, Theme-Aware, with Smooth Hover Animation */}
          <a
            href="mailto:fatimahtzahraa2.0@gmail.com"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-lg"
>
            Email Me
            <ArrowRight 
              size={18} 
              className="transition-transform duration-300 group-hover:translate-x-1" 
            />
          </a>
        </motion.div>
      </section>
    </main>
  );
}