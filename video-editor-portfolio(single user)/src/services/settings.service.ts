import { supabase } from "../lib/supabase";

export interface SiteSettings {
  id: string;
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_email: string;
  logo_url: string | null;
  favicon_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsFormData {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_email: string;
  logo_url: string;
  favicon_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
}

export const defaultSettings: SettingsFormData = {
  site_name: "Fatima Zara",
  hero_title: "Stories brought to life through powerful visuals.",
  hero_subtitle:
    "Professional video editing for YouTube, social media, advertisements and creative projects.",
  about_text:
    "I am Fatima Zara, a creative video editor who transforms raw footage into engaging visual stories.",
  contact_email: "fatimahtzahraa2.0@gmail.com",
  logo_url: "",
  favicon_url: "",
  instagram_url: "",
  youtube_url: "",
  linkedin_url: "",
};

const settingsSelectQuery = `
  id,
  site_name,
  hero_title,
  hero_subtitle,
  about_text,
  contact_email,
  logo_url,
  favicon_url,
  instagram_url,
  youtube_url,
  linkedin_url,
  created_at,
  updated_at
`;

export async function getSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(settingsSelectQuery)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SiteSettings | null;
}

export async function createSettings(
  settings: SettingsFormData
): Promise<SiteSettings> {
  const payload = {
    site_name: settings.site_name.trim(),
    hero_title: settings.hero_title.trim(),
    hero_subtitle: settings.hero_subtitle.trim(),
    about_text: settings.about_text.trim(),
    contact_email: settings.contact_email.trim(),
    logo_url: settings.logo_url.trim() || null,
    favicon_url: settings.favicon_url.trim() || null,
    instagram_url: settings.instagram_url.trim() || null,
    youtube_url: settings.youtube_url.trim() || null,
    linkedin_url: settings.linkedin_url.trim() || null,
  };

  const { data, error } = await supabase
    .from("site_settings")
    .insert(payload)
    .select(settingsSelectQuery)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SiteSettings;
}

export async function updateSettings(
  id: string,
  settings: SettingsFormData
): Promise<SiteSettings> {
  const payload = {
    site_name: settings.site_name.trim(),
    hero_title: settings.hero_title.trim(),
    hero_subtitle: settings.hero_subtitle.trim(),
    about_text: settings.about_text.trim(),
    contact_email: settings.contact_email.trim(),
    logo_url: settings.logo_url.trim() || null,
    favicon_url: settings.favicon_url.trim() || null,
    instagram_url: settings.instagram_url.trim() || null,
    youtube_url: settings.youtube_url.trim() || null,
    linkedin_url: settings.linkedin_url.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", id)
    .select(settingsSelectQuery)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SiteSettings;
}

export async function saveSettings(
  settings: SettingsFormData
): Promise<SiteSettings> {
  const existingSettings = await getSettings();

  if (existingSettings) {
    return updateSettings(existingSettings.id, settings);
  }

  return createSettings(settings);
}

export async function resetSettings(): Promise<SiteSettings> {
  return saveSettings(defaultSettings);
}

export function convertSettingsToForm(
  settings: SiteSettings
): SettingsFormData {
  return {
    site_name: settings.site_name || "",
    hero_title: settings.hero_title || "",
    hero_subtitle: settings.hero_subtitle || "",
    about_text: settings.about_text || "",
    contact_email: settings.contact_email || "",
    logo_url: settings.logo_url || "",
    favicon_url: settings.favicon_url || "",
    instagram_url: settings.instagram_url || "",
    youtube_url: settings.youtube_url || "",
    linkedin_url: settings.linkedin_url || "",
  };
}