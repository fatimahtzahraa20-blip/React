import { useEffect, useState, type FormEvent } from "react";

import supabase from "../../lib/supabase";

type WebsiteSettings = {
  id: boolean;
  portfolio_name: string;
  hero_title: string;
  hero_description: string;
  about_text: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  youtube: string;
  facebook: string;
  instagram: string;
  cv_url: string;
  footer_text: string;
};

const initialSettings: WebsiteSettings = {
  id: true,
  portfolio_name: "",
  hero_title: "",
  hero_description: "",
  about_text: "",
  email: "",
  phone: "",
  location: "",
  github: "",
  linkedin: "",
  youtube: "",
  facebook: "",
  instagram: "",
  cv_url: "",
  footer_text: "",
};

export default function Settings() {
  const [settings, setSettings] =
    useState<WebsiteSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError("");

      const { data, error: settingsError } = await supabase
        .from("website_settings")
        .select("*")
        .eq("id", true)
        .maybeSingle();

      if (settingsError) {
        setError(settingsError.message);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          id: true,
          portfolio_name: data.portfolio_name ?? "",
          hero_title: data.hero_title ?? "",
          hero_description: data.hero_description ?? "",
          about_text: data.about_text ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          github: data.github ?? "",
          linkedin: data.linkedin ?? "",
          youtube: data.youtube ?? "",
          facebook: data.facebook ?? "",
          instagram: data.instagram ?? "",
          cv_url: data.cv_url ?? "",
          footer_text: data.footer_text ?? "",
        });
      }

      setLoading(false);
    };

    void loadSettings();
  }, []);

  const updateField = (
    field: keyof WebsiteSettings,
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const { error: saveError } = await supabase
      .from("website_settings")
      .upsert(
        {
          ...settings,
          id: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setMessage("Website settings saved successfully.");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        Loading settings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Website Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Update your portfolio content without changing the source code.
          </p>
        </section>

        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-2xl font-bold">General Information</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Portfolio name
                </label>
                <input
                  type="text"
                  value={settings.portfolio_name}
                  onChange={(event) =>
                    updateField("portfolio_name", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Hero title
                </label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(event) =>
                    updateField("hero_title", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Hero description
              </label>
              <textarea
                rows={4}
                value={settings.hero_description}
                onChange={(event) =>
                  updateField("hero_description", event.target.value)
                }
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                About text
              </label>
              <textarea
                rows={6}
                value={settings.about_text}
                onChange={(event) =>
                  updateField("about_text", event.target.value)
                }
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-2xl font-bold">Contact Information</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-2xl font-bold">Social Links</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                ["github", "GitHub"],
                ["linkedin", "LinkedIn"],
                ["youtube", "YouTube"],
                ["facebook", "Facebook"],
                ["instagram", "Instagram"],
                ["cv_url", "CV URL"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium">
                    {label}
                  </label>
                  <input
                    type="url"
                    value={settings[field as keyof WebsiteSettings] as string}
                    onChange={(event) =>
                      updateField(
                        field as keyof WebsiteSettings,
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-2xl font-bold">Footer</h2>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Footer text
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(event) =>
                  updateField("footer_text", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </main>
  );
}