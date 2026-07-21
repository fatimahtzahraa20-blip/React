import { useEffect, useState, type FormEvent } from "react";
import type {
  PortfolioSettings,
  UpdatePortfolioSettingsInput,
} from "../../types/settings";

interface SettingsFormProps {
  settings: PortfolioSettings | null;
  saving?: boolean;
  onSubmit: (
    input: UpdatePortfolioSettingsInput
  ) => Promise<void> | void;
}

export default function SettingsForm({
  settings,
  saving = false,
  onSubmit,
}: SettingsFormProps) {
  const [form, setForm] =
    useState<UpdatePortfolioSettingsInput>({
      owner_name: "",
      professional_title: "",
      logo_text: "",
      profile_image_url: null,
      about_text: "",
      hero_badge: "",
      hero_title: "",
      hero_highlight: "",
      hero_description: "",
      email: "",
      phone: null,
      location: null,
      instagram_url: null,
      youtube_url: null,
      linkedin_url: null,
      facebook_url: null,
      github_url: null,
      contact_button_enabled: true,
      seo_title: "",
      seo_description: "",
    });

  useEffect(() => {
    if (!settings) {
      return;
    }

    setForm({
      owner_name: settings.owner_name ?? "",
      professional_title:
        settings.professional_title ?? "",
      logo_text: settings.logo_text ?? "",
      profile_image_url:
        settings.profile_image_url ?? null,
      about_text: settings.about_text ?? "",
      hero_badge: settings.hero_badge ?? "",
      hero_title: settings.hero_title ?? "",
      hero_highlight:
        settings.hero_highlight ?? "",
      hero_description:
        settings.hero_description ?? "",
      email: settings.email ?? "",
      phone: settings.phone ?? null,
      location: settings.location ?? null,
      instagram_url:
        settings.instagram_url ?? null,
      youtube_url:
        settings.youtube_url ?? null,
      linkedin_url:
        settings.linkedin_url ?? null,
      facebook_url:
        settings.facebook_url ?? null,
      github_url:
        settings.github_url ?? null,
      contact_button_enabled:
        settings.contact_button_enabled ?? true,
      seo_title: settings.seo_title ?? "",
      seo_description:
        settings.seo_description ?? "",
    });
  }, [settings]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checkbox =
        event.target as HTMLInputElement;

      setForm((current) => ({
        ...current,
        [name]: checkbox.checked,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSubmit({
      ...form,
      profile_image_url:
        form.profile_image_url?.trim() || null,
      phone: form.phone?.trim() || null,
      location: form.location?.trim() || null,
      instagram_url:
        form.instagram_url?.trim() || null,
      youtube_url:
        form.youtube_url?.trim() || null,
      linkedin_url:
        form.linkedin_url?.trim() || null,
      facebook_url:
        form.facebook_url?.trim() || null,
      github_url:
        form.github_url?.trim() || null,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">
          General Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <input
            name="owner_name"
            value={form.owner_name ?? ""}
            onChange={handleChange}
            placeholder="Owner name"
            className={inputClass}
          />

          <input
            name="professional_title"
            value={form.professional_title ?? ""}
            onChange={handleChange}
            placeholder="Professional title"
            className={inputClass}
          />

          <input
            name="logo_text"
            value={form.logo_text ?? ""}
            onChange={handleChange}
            placeholder="Logo text"
            className={inputClass}
          />

          <input
            name="profile_image_url"
            value={form.profile_image_url ?? ""}
            onChange={handleChange}
            placeholder="Profile image URL"
            className={inputClass}
          />
        </div>

        <textarea
          name="about_text"
          value={form.about_text ?? ""}
          onChange={handleChange}
          placeholder="About text"
          rows={5}
          className={`${inputClass} mt-5 resize-none`}
        />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">
          Hero Section
        </h2>

        <div className="mt-5 grid gap-5">
          <input
            name="hero_badge"
            value={form.hero_badge ?? ""}
            onChange={handleChange}
            placeholder="Hero badge"
            className={inputClass}
          />

          <input
            name="hero_title"
            value={form.hero_title ?? ""}
            onChange={handleChange}
            placeholder="Hero title"
            className={inputClass}
          />

          <input
            name="hero_highlight"
            value={form.hero_highlight ?? ""}
            onChange={handleChange}
            placeholder="Hero highlighted text"
            className={inputClass}
          />

          <textarea
            name="hero_description"
            value={form.hero_description ?? ""}
            onChange={handleChange}
            placeholder="Hero description"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">
          Contact Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <input
            type="email"
            name="email"
            value={form.email ?? ""}
            onChange={handleChange}
            placeholder="Email"
            className={inputClass}
          />

          <input
            name="phone"
            value={form.phone ?? ""}
            onChange={handleChange}
            placeholder="Phone"
            className={inputClass}
          />

          <input
            name="location"
            value={form.location ?? ""}
            onChange={handleChange}
            placeholder="Location"
            className={inputClass}
          />
        </div>

        <label className="mt-5 flex items-center gap-3">
          <input
            type="checkbox"
            name="contact_button_enabled"
            checked={
              form.contact_button_enabled ?? true
            }
            onChange={handleChange}
          />

          <span className="text-sm text-zinc-300">
            Show contact buttons
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">
          Social Links
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <input
            name="instagram_url"
            value={form.instagram_url ?? ""}
            onChange={handleChange}
            placeholder="Instagram URL"
            className={inputClass}
          />

          <input
            name="youtube_url"
            value={form.youtube_url ?? ""}
            onChange={handleChange}
            placeholder="YouTube URL"
            className={inputClass}
          />

          <input
            name="linkedin_url"
            value={form.linkedin_url ?? ""}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className={inputClass}
          />

          <input
            name="facebook_url"
            value={form.facebook_url ?? ""}
            onChange={handleChange}
            placeholder="Facebook URL"
            className={inputClass}
          />

          <input
            name="github_url"
            value={form.github_url ?? ""}
            onChange={handleChange}
            placeholder="GitHub URL"
            className={inputClass}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">
          SEO
        </h2>

        <div className="mt-5 grid gap-5">
          <input
            name="seo_title"
            value={form.seo_title ?? ""}
            onChange={handleChange}
            placeholder="SEO title"
            className={inputClass}
          />

          <textarea
            name="seo_description"
            value={form.seo_description ?? ""}
            onChange={handleChange}
            placeholder="SEO description"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Saving Settings..."
          : "Save Settings"}
      </button>
    </form>
  );
}