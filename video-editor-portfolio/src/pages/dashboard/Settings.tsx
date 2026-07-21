import { useState } from "react";
import { Link } from "react-router-dom";

interface SettingsData {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
}

const defaultSettings: SettingsData = {
  siteName: "Video Editor Portfolio",
  heroTitle: "Professional Video Editor",
  heroSubtitle: "Creative video editing and visual storytelling.",
  contactEmail: "your-email@example.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
  linkedinUrl: "https://linkedin.com",
};

export default function DashboardSettings() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const savedSettings = localStorage.getItem("portfolio-settings");

    if (savedSettings) {
      return JSON.parse(savedSettings) as SettingsData;
    }

    return defaultSettings;
  });

  const [success, setSuccess] = useState("");

  const updateField = (field: keyof SettingsData, value: string) => {
    setSettings((previous: SettingsData) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("portfolio-settings", JSON.stringify(settings));
    setSuccess("Settings saved successfully.");
  };

  return (
    <section className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Settings</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Site name"
              value={settings.siteName}
              onChange={(value) => updateField("siteName", value)}
            />

            <InputField
              label="Contact email"
              type="email"
              value={settings.contactEmail}
              onChange={(value) => updateField("contactEmail", value)}
            />

            <InputField
              label="Hero title"
              value={settings.heroTitle}
              onChange={(value) => updateField("heroTitle", value)}
            />

            <InputField
              label="Hero subtitle"
              value={settings.heroSubtitle}
              onChange={(value) => updateField("heroSubtitle", value)}
            />

            <InputField
              label="Instagram URL"
              type="url"
              value={settings.instagramUrl}
              onChange={(value) => updateField("instagramUrl", value)}
            />

            <InputField
              label="YouTube URL"
              type="url"
              value={settings.youtubeUrl}
              onChange={(value) => updateField("youtubeUrl", value)}
            />

            <InputField
              label="LinkedIn URL"
              type="url"
              value={settings.linkedinUrl}
              onChange={(value) => updateField("linkedinUrl", value)}
            />
          </div>

          {success && (
            <p className="mt-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
          >
            Save Settings
          </button>
        </form>
      </div>
    </section>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}

function InputField({
  label,
  value,
  type = "text",
  onChange,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-white/40"
      />
    </label>
  );
}