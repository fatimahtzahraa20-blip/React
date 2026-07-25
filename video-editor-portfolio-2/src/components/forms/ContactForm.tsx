import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  contactSchema,
  type ContactFormValues,
} from "../../schemas/contact.schema";

interface ContactFormProps {
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    values: ContactFormValues
  ) => Promise<void> | void;
}

export default function ContactForm({
  loading = false,
  submitLabel = "Send Message",
  onSubmit,
}: ContactFormProps) {
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const submitForm = async (
    values: ContactFormValues
  ) => {
    try {
      setSuccess("");

      await onSubmit(values);

      setSuccess(
        "Your message has been sent successfully."
      );

      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-5 rounded-2xl border border-white/10 bg-zinc-950 p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Name
        </label>

        <input
          type="text"
          placeholder="Your name"
          {...register("name")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
        />

        {errors.name && (
          <p className="mt-2 text-sm text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Email
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
        />

        {errors.email && (
          <p className="mt-2 text-sm text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Subject
        </label>

        <input
          type="text"
          placeholder="Project Discussion"
          {...register("subject")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
        />

        {errors.subject && (
          <p className="mt-2 text-sm text-red-400">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Message
        </label>

        <textarea
          rows={6}
          placeholder="Tell me about your project..."
          {...register("message")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
        />

        {errors.message && (
          <p className="mt-2 text-sm text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}