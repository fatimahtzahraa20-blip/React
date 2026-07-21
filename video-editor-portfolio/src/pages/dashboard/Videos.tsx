import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FaGithub, FaYoutube } from "react-icons/fa"; // <-- Brand icons yahan se import honge
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type VideoSource =
  | "supabase"
  | "youtube"
  | "google_drive"
  | "github"
  | "direct_url";

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  video_source: VideoSource;
  category_id: string | null;
  subcategory_id: string | null;
  featured: boolean;
  views: number;
  tags: string[] | null;
  display_order: number;
  created_at: string;
  categories: { name: string } | null;
  sub_categories: { name: string } | null;
}

interface VideoForm {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  tags: string;
  featured: boolean;
  displayOrder: string;
  videoSource: VideoSource;
  externalVideoUrl: string;
  externalThumbnailUrl: string;
}

const initialForm: VideoForm = {
  title: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  tags: "",
  featured: false,
  displayOrder: "0",
  videoSource: "supabase",
  externalVideoUrl: "",
  externalThumbnailUrl: "",
};

const sourceOptions: {
  value: VideoSource;
  label: string;
  description: string;
}[] = [
  {
    value: "supabase",
    label: "Upload Video",
    description: "Upload an MP4, WebM or MOV file.",
  },
  {
    value: "youtube",
    label: "YouTube",
    description: "Paste a YouTube watch, share or Shorts link.",
  },
  {
    value: "google_drive",
    label: "Google Drive",
    description: "Paste a public Google Drive file link.",
  },
  {
    value: "github",
    label: "GitHub",
    description: "Paste a raw GitHub video-file URL.",
  },
  {
    value: "direct_url",
    label: "Direct URL",
    description: "Paste a direct public MP4 or WebM URL.",
  },
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function getYouTubeEmbedUrl(input: string) {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
      } else if (url.pathname.startsWith("/live/")) {
        videoId = url.pathname.split("/live/")[1]?.split("/")[0] ?? "";
      } else {
        videoId = url.searchParams.get("v") ?? "";
      }
    }

    videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

function getGoogleDrivePreviewUrl(input: string) {
  const value = input.trim();

  const fileId =
    value.match(/\/file\/d\/([^/?]+)/)?.[1] ??
    value.match(/[?&]id=([^&]+)/)?.[1];

  return fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : null;
}

function getGitHubRawUrl(input: string) {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.replace(/^www\./, "");

    // Already-direct GitHub URLs.
    if (
      hostname === "raw.githubusercontent.com" ||
      hostname.endsWith(".github.io") ||
      (hostname === "github.com" && url.pathname.includes("/releases/download/"))
    ) {
      return url.toString();
    }

    // Convert a normal public repository blob link to a raw file link.
    if (hostname === "github.com" && url.pathname.includes("/blob/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const blobIndex = parts.indexOf("blob");

      if (blobIndex < 2 || blobIndex >= parts.length - 1) {
        return null;
      }

      const owner = parts[0];
      const repository = parts[1];
      const branchAndPath = parts.slice(blobIndex + 1).join("/");

      return `https://raw.githubusercontent.com/${owner}/${repository}/${branchAndPath}`;
    }

    return null;
  } catch {
    return null;
  }
}

function getDirectVideoUrl(input: string) {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function normalizeVideoUrl(source: VideoSource, input: string) {
  if (source === "youtube") return getYouTubeEmbedUrl(input);
  if (source === "google_drive") return getGoogleDrivePreviewUrl(input);
  if (source === "github") return getGitHubRawUrl(input);
  if (source === "direct_url") return getDirectVideoUrl(input);
  return null;
}

function getStoragePath(publicUrl: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

function sourceLabel(source: VideoSource) {
  return (
    sourceOptions.find((option) => option.value === source)?.label ??
    source
  );
}

export default function DashboardVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [form, setForm] = useState<VideoForm>(initialForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subcategory) => subcategory.category_id === form.categoryId
      ),
    [subCategories, form.categoryId]
  );

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    const [videosResult, categoriesResult, subCategoriesResult] =
      await Promise.all([
        supabase
          .from("videos")
          .select(`
            id,
            title,
            slug,
            description,
            thumbnail_url,
            video_url,
            video_source,
            category_id,
            subcategory_id,
            featured,
            views,
            tags,
            display_order,
            created_at,
            categories (name),
            sub_categories (name)
          `)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("sub_categories")
          .select("id, category_id, name")
          .order("name"),
      ]);

    if (videosResult.error) {
      setErrorMessage(videosResult.error.message);
    } else {
      setVideos((videosResult.data ?? []) as unknown as VideoItem[]);
    }

    if (categoriesResult.error) {
      setErrorMessage(categoriesResult.error.message);
    } else {
      setCategories(categoriesResult.data ?? []);
    }

    if (subCategoriesResult.error) {
      setErrorMessage(subCategoriesResult.error.message);
    } else {
      setSubCategories(subCategoriesResult.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateForm<K extends keyof VideoForm>(
    field: K,
    value: VideoForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setThumbnailFile(null);
    setVideoFile(null);
    setEditingVideo(null);
  }

  function changeSource(source: VideoSource) {
    setForm((previous) => ({
      ...previous,
      videoSource: source,
      externalVideoUrl: "",
    }));
    setVideoFile(null);
  }

  function startEditing(video: VideoItem) {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description ?? "",
      categoryId: video.category_id ?? "",
      subcategoryId: video.subcategory_id ?? "",
      tags: video.tags?.join(", ") ?? "",
      featured: video.featured,
      displayOrder: String(video.display_order ?? 0),
      videoSource: video.video_source ?? "supabase",
      externalVideoUrl:
        video.video_source === "supabase" ? "" : video.video_url,
      externalThumbnailUrl: video.thumbnail_url ?? "",
    });
    setThumbnailFile(null);
    setVideoFile(null);
    setErrorMessage("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFile(
    bucket: "video-files" | "video-thumbnails",
    file: File
  ) {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(
      file.name
    )}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(bucket).getPublicUrl(uniqueName);

    return {
      publicUrl: data.publicUrl,
      storagePath: uniqueName,
    };
  }

  async function removeUploadedFile(
    bucket: "video-files" | "video-thumbnails",
    path: string | null
  ) {
    if (!path) return;
    await supabase.storage.from(bucket).remove([path]);
  }

  function validateForm() {
    if (!form.title.trim()) return "Please enter a video title.";
    if (!form.categoryId) return "Please choose a category.";

    if (!editingVideo && !thumbnailFile && !form.externalThumbnailUrl.trim()) {
      return "Please choose a thumbnail image or enter a thumbnail URL.";
    }

    if (
      form.videoSource === "supabase" &&
      !editingVideo &&
      !videoFile
    ) {
      return "Please choose a video file.";
    }

    if (
      form.videoSource !== "supabase" &&
      !form.externalVideoUrl.trim()
    ) {
      return `Please enter the ${sourceLabel(
        form.videoSource
      )} video link.`;
    }

    if (thumbnailFile && !thumbnailFile.type.startsWith("image/")) {
      return "The thumbnail must be an image file.";
    }

    if (videoFile && !videoFile.type.startsWith("video/")) {
      return "Please choose a valid video file.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);

    let newThumbnailPath: string | null = null;
    let newVideoPath: string | null = null;

    try {
      let thumbnailUrl =
        form.externalThumbnailUrl.trim() ||
        editingVideo?.thumbnail_url ||
        "";
      let videoUrl = editingVideo?.video_url ?? "";

      if (thumbnailFile) {
        const uploaded = await uploadFile(
          "video-thumbnails",
          thumbnailFile
        );
        thumbnailUrl = uploaded.publicUrl;
        newThumbnailPath = uploaded.storagePath;
      }

      if (form.videoSource === "supabase") {
        if (videoFile) {
          const uploaded = await uploadFile("video-files", videoFile);
          videoUrl = uploaded.publicUrl;
          newVideoPath = uploaded.storagePath;
        }
      } else {
        const normalizedUrl = normalizeVideoUrl(
          form.videoSource,
          form.externalVideoUrl
        );

        if (!normalizedUrl) {
          throw new Error(
            `The ${sourceLabel(form.videoSource)} link is not valid.`
          );
        }

        videoUrl = normalizedUrl;
      }

      const baseSlug = createSlug(form.title);
      const slug =
        editingVideo?.slug ??
        `${baseSlug || "video"}-${Date.now()}`;

      const record = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || null,
        thumbnail_url: thumbnailUrl || null,
        video_url: videoUrl,
        video_source: form.videoSource,
        category_id: form.categoryId || null,
        subcategory_id: form.subcategoryId || null,
        featured: form.featured,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        display_order: Number(form.displayOrder) || 0,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update(record)
          .eq("id", editingVideo.id);

        if (error) throw new Error(error.message);

        if (
          thumbnailFile &&
          editingVideo.thumbnail_url?.includes(
            "/storage/v1/object/public/video-thumbnails/"
          )
        ) {
          await removeUploadedFile(
            "video-thumbnails",
            getStoragePath(
              editingVideo.thumbnail_url,
              "video-thumbnails"
            )
          );
        }

        if (
          editingVideo.video_source === "supabase" &&
          (videoFile || form.videoSource !== "supabase") &&
          editingVideo.video_url
        ) {
          await removeUploadedFile(
            "video-files",
            getStoragePath(editingVideo.video_url, "video-files")
          );
        }

        setSuccessMessage("Video updated successfully.");
      } else {
        const { error } = await supabase.from("videos").insert(record);

        if (error) throw new Error(error.message);

        setSuccessMessage("Video added successfully.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      await removeUploadedFile("video-thumbnails", newThumbnailPath);
      await removeUploadedFile("video-files", newVideoPath);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save video."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(video: VideoItem) {
    const confirmed = window.confirm(
      `Delete "${video.title}" permanently?`
    );

    if (!confirmed) return;

    setDeletingId(video.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (error) throw new Error(error.message);

      const removalTasks: Promise<void>[] = [];

      if (
        video.thumbnail_url?.includes(
          "/storage/v1/object/public/video-thumbnails/"
        )
      ) {
        removalTasks.push(
          removeUploadedFile(
            "video-thumbnails",
            getStoragePath(
              video.thumbnail_url,
              "video-thumbnails"
            )
          )
        );
      }

      if (video.video_source === "supabase") {
        removalTasks.push(
          removeUploadedFile(
            "video-files",
            getStoragePath(video.video_url, "video-files")
          )
        );
      }

      await Promise.all(removalTasks);

      setVideos((previous) =>
        previous.filter((item) => item.id !== video.id)
      );
      setSuccessMessage("Video deleted successfully.");

      if (editingVideo?.id === video.id) resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete video."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-purple-400">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-bold">Manage Videos</h1>
            <p className="mt-3 text-zinc-400">
              Add Supabase, YouTube, Google Drive, GitHub or direct-link videos.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {editingVideo ? "Edit Video" : "Add New Video"}
            </h2>

            {editingVideo && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
              >
                <X size={17} />
                Cancel editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid gap-6 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Video title *
                </span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Cinematic Travel Edit"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium">
                  Display order
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(event) =>
                    updateForm("displayOrder", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium">
                  Category *
                </span>
                <select
                  value={form.categoryId}
                  onChange={(event) => {
                    updateForm("categoryId", event.target.value);
                    updateForm("subcategoryId", "");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
                >
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium">
                  Subcategory
                </span>
                <select
                  value={form.subcategoryId}
                  onChange={(event) =>
                    updateForm("subcategoryId", event.target.value)
                  }
                  disabled={!form.categoryId}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none disabled:opacity-50 focus:border-purple-500"
                >
                  <option value="">No subcategory</option>
                  {availableSubCategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span className="mb-2 block text-sm font-medium">
                Description
              </span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Describe this editing project..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">
                Tags separated by commas
              </span>
              <input
                value={form.tags}
                onChange={(event) =>
                  updateForm("tags", event.target.value)
                }
                placeholder="cinematic, travel, color grading"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
              />
            </label>

            <div>
              <span className="mb-3 block text-sm font-medium">
                Video source *
              </span>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {sourceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeSource(option.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      form.videoSource === option.value
                        ? "border-purple-500 bg-purple-500/15"
                        : "border-white/10 bg-black hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {option.value === "youtube" && <FaYoutube size={18} />} {/* <-- Changed */}
                      {option.value === "github" && <FaGithub size={18} />} {/* <-- Changed */}
                      {option.value === "supabase" && <Upload size={18} />}
                      {(option.value === "google_drive" ||
                        option.value === "direct_url") && (
                        <LinkIcon size={18} />
                      )}
                      {option.label}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-zinc-500">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {form.videoSource === "supabase" ? (
              <label className="block rounded-xl border border-dashed border-white/15 bg-black p-5">
                <span className="mb-3 flex items-center gap-2 font-medium">
                  <Upload size={18} />
                  Video file {!editingVideo && "*"}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) =>
                    setVideoFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-medium file:text-black"
                />
                <p className="mt-3 break-all text-xs text-zinc-500">
                  {videoFile
                    ? videoFile.name
                    : editingVideo
                    ? "Leave empty to keep the existing uploaded video."
                    : "Choose an MP4, WebM or MOV file."}
                </p>
              </label>
            ) : (
              <label>
                <span className="mb-2 block text-sm font-medium">
                  {sourceLabel(form.videoSource)} video link *
                </span>
                <input
                  type="url"
                  value={form.externalVideoUrl}
                  onChange={(event) =>
                    updateForm("externalVideoUrl", event.target.value)
                  }
                  placeholder={
                    form.videoSource === "youtube"
                      ? "https://www.youtube.com/watch?v=..."
                      : form.videoSource === "google_drive"
                      ? "https://drive.google.com/file/d/.../view"
                      : form.videoSource === "github"
                      ? "https://github.com/user/repo/blob/main/video.mp4"
                      : "https://example.com/video.mp4"
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  {form.videoSource === "google_drive" &&
                    'Set sharing to "Anyone with the link".'}
                  {form.videoSource === "github" &&
                    "The repository must be public. A GitHub blob link will be converted to a raw URL."}
                  {form.videoSource === "youtube" &&
                    "The video owner must allow embedding."}
                  {form.videoSource === "direct_url" &&
                    "Use a public direct MP4 or WebM URL."}
                </p>
              </label>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <label className="rounded-xl border border-dashed border-white/15 bg-black p-5">
                <span className="mb-3 flex items-center gap-2 font-medium">
                  <Upload size={18} />
                  Upload thumbnail
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setThumbnailFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-medium file:text-black"
                />
                <p className="mt-3 break-all text-xs text-zinc-500">
                  {thumbnailFile
                    ? thumbnailFile.name
                    : "JPG, PNG or WebP"}
                </p>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium">
                  Or paste thumbnail URL
                </span>
                <input
                  type="url"
                  value={form.externalThumbnailUrl}
                  onChange={(event) =>
                    updateForm(
                      "externalThumbnailUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  An uploaded thumbnail takes priority over this URL.
                </p>
              </label>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateForm("featured", event.target.checked)
                }
                className="h-5 w-5 accent-purple-500"
              />
              <span>Show this video in Featured Work</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : editingVideo ? (
                <>
                  <Pencil size={18} />
                  Update Video
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Video
                </>
              )}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Saved Videos</h2>
            <span className="text-sm text-zinc-500">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center rounded-2xl border border-white/10 bg-zinc-950 py-16">
              <Loader2 className="animate-spin text-purple-400" size={30} />
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 p-12 text-center text-zinc-400">
              No videos have been added.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                >
                  <div className="aspect-video bg-zinc-900">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-purple-500/15 px-3 py-1 text-purple-300">
                        {sourceLabel(video.video_source)}
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-400">
                        {video.categories?.name ?? "Uncategorized"}
                      </span>
                      {video.featured && (
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold">{video.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                      {video.description || "No description"}
                    </p>

                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
                    >
                      Open saved video link
                      <ExternalLink size={15} />
                    </a>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEditing(video)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === video.id}
                        onClick={() => void handleDelete(video)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === video.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}