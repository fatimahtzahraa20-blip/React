import {
  Globe,
  Image,
  Link,
  Mail,
  RefreshCcw,
  Save,
  Settings as SettingsIcon,
  Video,
} from "lucide-react";
import useSettings from "../../hooks/useSettings";

export default function Settings() {
  const {
    settings,
    loading,
    saving,
    error,
    success,
    updateField,
    save,
    reset,
  } = useSettings();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await save();
  }

  async function handleReset() {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings?"
    );

    if (confirmed) {
      await reset();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-blue-500" size={28} />

          <h1 className="text-3xl font-bold text-white">
            Site Settings
          </h1>
        </div>

        <p className="mt-2 text-gray-400">
          Manage the content and social links of your portfolio.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Globe className="text-blue-500" size={22} />

            <div>
              <h2 className="text-xl font-semibold text-white">
                General Information
              </h2>

              <p className="text-sm text-gray-400">
                Basic information displayed on your website.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Site Name"
              value={settings.site_name}
              onChange={(value) =>
                updateField("site_name", value)
              }
              placeholder="Fatima Zara"
              required
            />

            <InputField
              label="Contact Email"
              type="email"
              value={settings.contact_email}
              onChange={(value) =>
                updateField("contact_email", value)
              }
              placeholder="your@email.com"
              icon={<Mail size={18} />}
              required
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Hero Section
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Main heading and introduction shown on the homepage.
            </p>
          </div>

          <div className="space-y-6">
            <InputField
              label="Hero Title"
              value={settings.hero_title}
              onChange={(value) =>
                updateField("hero_title", value)
              }
              placeholder="Your main portfolio heading"
              required
            />

            <TextAreaField
              label="Hero Subtitle"
              value={settings.hero_subtitle}
              onChange={(value) =>
                updateField("hero_subtitle", value)
              }
              placeholder="Write a short introduction"
              rows={4}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              About Section
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Describe your experience and video-editing skills.
            </p>
          </div>

          <TextAreaField
            label="About Text"
            value={settings.about_text}
            onChange={(value) =>
              updateField("about_text", value)
            }
            placeholder="Tell visitors about yourself"
            rows={7}
          />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Image className="text-blue-500" size={22} />

            <div>
              <h2 className="text-xl font-semibold text-white">
                Branding
              </h2>

              <p className="text-sm text-gray-400">
                Enter public URLs for your logo and favicon.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Logo URL"
              type="url"
              value={settings.logo_url}
              onChange={(value) =>
                updateField("logo_url", value)
              }
              placeholder="https://example.com/logo.png"
            />

            <InputField
              label="Favicon URL"
              type="url"
              value={settings.favicon_url}
              onChange={(value) =>
                updateField("favicon_url", value)
              }
              placeholder="https://example.com/favicon.png"
            />
          </div>

          {settings.logo_url && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-gray-400">
                Logo preview
              </p>

              <img
                src={settings.logo_url}
                alt="Logo preview"
                className="h-20 w-20 rounded-xl border border-zinc-700 object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Social Links
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Leave a field empty when you do not want to display it.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
           <InputField
  label="Instagram URL"
  type="url"
  value={settings.instagram_url}
  onChange={(value) => updateField("instagram_url", value)}
  placeholder="https://instagram.com/username"
  icon={<Link size={18} />}
/>

<InputField
  label="YouTube URL"
  type="url"
  value={settings.youtube_url}
  onChange={(value) => updateField("youtube_url", value)}
  placeholder="https://youtube.com/@channel"
  icon={<Video size={18} />}
/>

<InputField
  label="LinkedIn URL"
  type="url"
  value={settings.linkedin_url}
  onChange={(value) => updateField("linkedin_url", value)}
  placeholder="https://linkedin.com/in/username"
  icon={<Link size={18} />}
/>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 font-medium text-gray-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw size={18} />
            Reset
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  icon,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>

      <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950 px-3 focus-within:border-blue-500">
        {icon && (
          <span className="text-gray-500">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
      />
    </div>
  );
}