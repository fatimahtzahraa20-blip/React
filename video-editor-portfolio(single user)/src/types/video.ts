export type VideoSource =
  | "youtube"
  | "vimeo"
  | "google_drive"
  | "direct";

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
}

export interface VideoSubCategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

export interface Video {
  id: string;

  title: string;
  slug: string;
  description: string;

  video_url: string;
  thumbnail_url: string;
  video_source: VideoSource;

  category_id: string;
  subcategory_id: string | null;

  featured: boolean;
  views: number;
  display_order: number;

  tags: string[];

  created_at: string;
  updated_at: string;

  category?: VideoCategory | null;
  subcategory?: VideoSubCategory | null;
}

export interface CreateVideoInput {
  title: string;
  slug: string;
  description: string;

  video_url: string;
  thumbnail_url: string;
  video_source: VideoSource;

  category_id: string;
  subcategory_id?: string | null;

  featured: boolean;
  views: number;
  display_order: number;

  tags: string[];
}

export type UpdateVideoInput =
  Partial<CreateVideoInput>;

export interface VideoFormData {
  title: string;
  slug: string;
  description: string;

  video_url: string;
  thumbnail_url: string;
  video_source: VideoSource;

  category_id: string;
  subcategory_id: string | null;

  featured: boolean;
  views: number;
  display_order: number;

  tags: string[];
}