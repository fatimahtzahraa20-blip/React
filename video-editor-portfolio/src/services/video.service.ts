import { supabase } from "../lib/supabase";

export interface Video {
  id: number;
  title: string;
  category: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  created_at: string;
}

export interface VideoFormData {
  title: string;
  category: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  featured: boolean;
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addVideo(
  video: VideoFormData
): Promise<Video> {
  const { data, error } = await supabase
    .from("videos")
    .insert({
      title: video.title,
      category: video.category,
      description: video.description || null,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || null,
      featured: video.featured,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateVideo(
  id: number,
  video: VideoFormData
): Promise<Video> {
  const { data, error } = await supabase
    .from("videos")
    .update({
      title: video.title,
      category: video.category,
      description: video.description || null,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || null,
      featured: video.featured,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteVideo(id: number): Promise<void> {
  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}