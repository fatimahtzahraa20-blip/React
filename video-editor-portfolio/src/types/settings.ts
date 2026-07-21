export interface PortfolioSettings {
  id: string;
  owner_name: string;
  professional_title: string;
  logo_text: string;
  profile_image_url: string | null;
  about_text: string;
  hero_badge: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;
  email: string;
  phone: string | null;
  location: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  github_url: string | null;
  contact_button_enabled: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface UpdatePortfolioSettingsInput {
  owner_name?: string;
  professional_title?: string;
  logo_text?: string;
  profile_image_url?: string | null;
  about_text?: string;
  hero_badge?: string;
  hero_title?: string;
  hero_highlight?: string;
  hero_description?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  github_url?: string | null;
  contact_button_enabled?: boolean;
  seo_title?: string;
  seo_description?: string;
}