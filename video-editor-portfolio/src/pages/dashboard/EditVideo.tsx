import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
}

type VideoSource = "youtube" | "google_drive";

interface VideoFormData {
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category_id: string;
  subcategory_id: string;
  tags: string;
  featured: boolean;
  display_order: number;
}

const initialForm: VideoFormData = {
  title: "",
  description: "",
  thumbnail_url: "",
  video_url: "",
  category_id: "",
  subcategory_id: "",
  tags: "",
  featured: false,
  display_order: 0,
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function detectVideoSource(
  url: string
): VideoSource | null {
  const normalizedUrl = url.toLowerCase();

  if (
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (normalizedUrl.includes("drive.google.com")) {
    return "google_drive";
  }

  return null;
}

function convertTagsToText(
  tags: unknown
): string {
  if (Array.isArray(tags)) {
    return tags
      .filter(
        (tag): tag is string =>
          typeof tag === "string"
      )
      .join(", ");
  }

  if (typeof tags === "string") {
    return tags;
  }

  return "";
}

export default function EditVideo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] =
    useState<VideoFormData>(initialForm);

  const [originalSlug, setOriginalSlug] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subCategories, setSubCategories] =
    useState<SubCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    const loadPageData = async () => {
      if (!id) {
        setErrorMessage("Video ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const [
        videoResult,
        categoriesResult,
        subCategoriesResult,
      ] = await Promise.all([
        supabase
          .from("videos")
          .select(`
            id,
            title,
            slug,
            description,
            thumbnail_url,
            video_url,
            category_id,
            subcategory_id,
            tags,
            featured,
            display_order
          `)
          .eq("id", id)
          .single(),

        supabase
          .from("categories")
          .select("id, name")
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("sub_categories")
          .select("id, category_id, name")
          .order("name", {
            ascending: true,
          }),
      ]);

      if (videoResult.error) {
        setErrorMessage(
          videoResult.error.message
        );
        setLoading(false);
        return;
      }

      if (categoriesResult.error) {
        setErrorMessage(
          categoriesResult.error.message
        );
        setLoading(false);
        return;
      }

      if (subCategoriesResult.error) {
        setErrorMessage(
          subCategoriesResult.error.message
        );
        setLoading(false);
        return;
      }

      const video = videoResult.data;

      setForm({
        title: video.title ?? "",
        description: video.description ?? "",
        thumbnail_url:
          video.thumbnail_url ?? "",
        video_url: video.video_url ?? "",
        category_id:
          video.category_id ?? "",
        subcategory_id:
          video.subcategory_id ?? "",
        tags: convertTagsToText(video.tags),
        featured: video.featured ?? false,
        display_order:
          video.display_order ?? 0,
      });

      setOriginalSlug(video.slug ?? "");
      setCategories(categoriesResult.data ?? []);
      setSubCategories(
        subCategoriesResult.data ?? []
      );

      setLoading(false);
    };

    void loadPageData();
  }, [id]);

  const filteredSubCategories =
    subCategories.filter(
      (subCategory) =>
        subCategory.category_id ===
        form.category_id
    );

  const handleInputChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "display_order"
          ? Number(value)
          : value,
    }));
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      category_id: event.target.value,
      subcategory_id: "",
    }));
  };

  const handleFeaturedChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      featured: event.target.checked,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!id) {
      setErrorMessage("Video ID is missing.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage(
        "Video title is required."
      );
      return;
    }

    if (!form.video_url.trim()) {
      setErrorMessage(
        "YouTube or Google Drive URL is required."
      );
      return;
    }

    if (!form.category_id) {
      setErrorMessage(
        "Please select a category."
      );
      return;
    }

    const videoSource = detectVideoSource(
      form.video_url
    );

    if (!videoSource) {
      setErrorMessage(
        "Please enter a valid YouTube or Google Drive URL."
      );
      return;
    }

    setSaving(true);

    const formattedTags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const updatedSlug =
      createSlug(form.title) ||
      originalSlug ||
      `video-${Date.now()}`;

    const { error } = await supabase
      .from("videos")
      .update({
        title: form.title.trim(),
        slug: updatedSlug,
        description:
          form.description.trim(),
        thumbnail_url:
          form.thumbnail_url.trim() || null,
        video_url: form.video_url.trim(),
        video_source: videoSource,
        category_id: form.category_id,
        subcategory_id:
          form.subcategory_id || null,
        tags: formattedTags,
        featured: form.featured,
        display_order:
          Number(form.display_order) || 0,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage(
      "Video updated successfully."
    );

    setSaving(false);

    setTimeout(() => {
      navigate("/dashboard/videos");
    }, 800);
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />

          <p className="text-zinc-400">
            Loading video...
          </p>
        </div>
      </section>
    );
  }
    return (
    <section className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-400">
              Video Management
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Edit Video
            </h1>

            <p className="mt-2 text-zinc-400">
              Update your portfolio video
              information.
            </p>
          </div>

          <Link
            to="/dashboard/videos"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Back to Videos
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Video Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              required
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={6}
              value={form.description}
              onChange={handleInputChange}
              placeholder="Describe this video project"
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnail_url"
              className="mb-2 block text-sm font-medium"
            >
              Thumbnail URL
            </label>

            <input
              id="thumbnail_url"
              name="thumbnail_url"
              type="url"
              value={form.thumbnail_url}
              onChange={handleInputChange}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />

            {form.thumbnail_url && (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                <img
                  src={form.thumbnail_url}
                  alt="Video thumbnail preview"
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="video_url"
              className="mb-2 block text-sm font-medium"
            >
              YouTube or Google Drive URL
            </label>

            <input
              id="video_url"
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={handleInputChange}
              placeholder="Paste YouTube or Google Drive URL"
              required
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />

            {form.video_url && (
              <p className="mt-2 text-sm text-zinc-400">
                Source detected:{" "}
                <span className="font-medium capitalize text-white">
                  {detectVideoSource(
                    form.video_url
                  )?.replace("_", " ") ??
                    "Unsupported URL"}
                </span>
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="category_id"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleCategoryChange}
                required
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="subcategory_id"
                className="mb-2 block text-sm font-medium"
              >
                Sub Category
              </label>

              <select
                id="subcategory_id"
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleInputChange}
                disabled={!form.category_id}
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  Select sub category
                </option>

                {filteredSubCategories.map(
                  (subCategory) => (
                    <option
                      key={subCategory.id}
                      value={subCategory.id}
                    >
                      {subCategory.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
                    <div>
            <label
              htmlFor="tags"
              className="mb-2 block text-sm font-medium"
            >
              Tags
            </label>

            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleInputChange}
              placeholder="youtube, reels, shorts, commercial"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />

            <p className="mt-2 text-sm text-zinc-500">
              Separate tags with commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="display_order"
              className="mb-2 block text-sm font-medium"
            >
              Display Order
            </label>

            <input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              value={form.display_order}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black p-4">
            <div>
              <h3 className="font-medium">
                Featured Video
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                Show this video in the Featured Work section.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.featured}
              onChange={handleFeaturedChange}
              className="h-5 w-5 accent-white"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard/videos"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 font-medium transition hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Save size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}