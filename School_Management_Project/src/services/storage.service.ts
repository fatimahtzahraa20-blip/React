import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const maxBytes = 15 * 1024 * 1024;

export async function uploadFile(bucket: "assignment-files" | "submission-files" | "avatars" | "branding", ownerId: string, file: File) {
  if (bucket !== "avatars" && bucket !== "branding" && !allowedTypes.includes(file.type)) throw new Error("Only PDF, JPEG, PNG and WebP files are allowed.");
  if (file.size > maxBytes) throw new Error("Files must be smaller than 15 MB.");
  const uploadable = file.type.startsWith("image/") && file.size > 1_000_000
    ? await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true })
    : file;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${ownerId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, uploadable, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { path, name: file.name, type: file.type, size: uploadable.size };
}

export async function getSignedFileUrl(bucket: "assignment-files" | "submission-files", path: string) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
