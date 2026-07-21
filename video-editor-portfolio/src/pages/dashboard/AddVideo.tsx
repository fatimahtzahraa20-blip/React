import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

function detectVideoSource(url: string): VideoSource | null {
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

export default function AddVideo() {
  const navigate = useNavigate();

  const [form, setForm] = useState<VideoFormData>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingData(true);
      setErrorMessage("");

      const [categoriesResult, subCategoriesResult] =
        await Promise.all([
          supabase
            .from("categories")
            .select("id, name")
            .order("name", { ascending: true }),

          supabase
            .from("sub_categories")
            .select("id, category_id, name")
            .order("name", { ascending: true }),
        ]);

      if (categoriesResult.error) {
        setErrorMessage(categoriesResult.error.message);
        setLoadingData(false);
        return;
      }

      if (subCategoriesResult.error) {
        setErrorMessage(subCategoriesResult.error.message);
        setLoadingData(false);
        return;
      }

      setCategories(categoriesResult.data ?? []);
      setSubCategories(subCategoriesResult.data ?? []);
      setLoadingData(false);
    };

    void loadCategories();
  }, []);

  const filteredSubCategories = subCategories.filter(
    (subCategory) =>
      subCategory.category_id === form.category_id
  );

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      category_id: event.target.value,
      subcategory_id: "",
    }));
  };

  const handleFeaturedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      featured: event.target.checked,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Video title is required.");
      return;
    }

    if (!form.video_url.trim()) {
      setErrorMessage("YouTube or Google Drive URL is required.");
      return;
    }

    if (!form.category_id) {
      setErrorMessage("Please select a category.");
      return;
    }

    const videoSource = detectVideoSource(form.video_url);

    if (!videoSource) {
      setErrorMessage(
        "Please enter a valid YouTube or Google Drive video URL."
      );
      return;
    }

    setSaving(true);

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const videoData = {
      title: form.title.trim(),
      slug: `${createSlug(form.title)}-${Date.now()}`,
      description: form.description.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      video_url: form.video_url.trim(),
      video_source: videoSource,
      category_id: form.category_id,
      subcategory_id: form.subcategory_id || null,
      tags,
      featured: form.featured,
      views: 0,
      display_order: Number(form.display_order) || 0,
    };

    const { error } = await supabase
      .from("videos")
      .insert(videoData);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    navigate("/dashboard/videos");
  };

  return (
    <section className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-400">
              Video Management
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Add New Video
            </h1>

            <p className="mt-2 text-zinc-400">
              Add a YouTube or Google Drive project to your
              portfolio.
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
              rows={5}
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
              <img
                src={form.thumbnail_url}
                alt="Thumbnail preview"
                className="mt-4 aspect-video w-full max-w-md rounded-xl object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
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
              placeholder="Paste YouTube or Google Drive link"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />

            {form.video_url && (
              <p className="mt-2 text-sm text-zinc-400">
                Source detected:{" "}
                <span className="font-medium text-white">
                  {detectVideoSource(form.video_url)
                    ?.replace("_", " ") ?? "Unsupported URL"}
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
                disabled={loadingData}
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30 disabled:opacity-50"
              >
                <option value="">Select category</option>

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
                <option value="">Select sub category</option>

                {filteredSubCategories.map((subCategory) => (
                  <option
                    key={subCategory.id}
                    value={subCategory.id}
                  >
                    {subCategory.name}
                  </option>
                ))}
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
              placeholder="youtube, commercial, motion graphics"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
            />

            <p className="mt-2 text-sm text-zinc-500">
              Separate multiple tags with commas.
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

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black p-4">
            <div>
              <p className="font-medium">Featured Video</p>

              <p className="mt-1 text-sm text-zinc-400">
                Display this video in the Featured Work section.
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
              disabled={saving || loadingData}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Save size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}