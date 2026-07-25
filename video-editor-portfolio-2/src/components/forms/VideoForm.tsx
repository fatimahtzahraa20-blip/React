import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { Category } from "../../types/category";
import type { SubCategory } from "../../types/subcategory";
import type { VideoFormValues } from "../../schemas/video.schema";

interface VideoFormProps {
  categories: Category[];
  subCategories: SubCategory[];
  defaultValues?: Partial<VideoFormValues>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    values: VideoFormValues
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const emptyForm: VideoFormValues = {
  title: "",
  slug: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  video_source: "youtube",
  category_id: "",
  subcategory_id: null,
  featured: false,
  views: 0,
  display_order: 0,
  tags: [],
};

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function VideoForm({
  categories,
  subCategories,
  defaultValues,
  loading = false,
  submitLabel = "Save Video",
  onSubmit,
  onCancel,
}: VideoFormProps) {
  const [form, setForm] = useState<VideoFormValues>({
    ...emptyForm,
    ...defaultValues,
    tags: defaultValues?.tags ?? [],
    subcategory_id:
      defaultValues?.subcategory_id ?? null,
  });

  const [tagsInput, setTagsInput] = useState(
    defaultValues?.tags?.join(", ") ?? ""
  );

  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...defaultValues,
      tags: defaultValues?.tags ?? [],
      subcategory_id:
        defaultValues?.subcategory_id ?? null,
    });

    setTagsInput(
      defaultValues?.tags?.join(", ") ?? ""
    );

    setFormError("");
  }, [defaultValues]);

  const filteredSubCategories = useMemo(() => {
    if (!form.category_id) {
      return [];
    }

    return subCategories.filter(
      (subCategory) =>
        subCategory.category_id === form.category_id
    );
  }, [subCategories, form.category_id]);

  const handleTitleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const title = event.target.value;

    setForm((current) => {
      const previousGeneratedSlug = createSlug(
        current.title
      );

      const shouldUpdateSlug =
        !current.slug ||
        current.slug === previousGeneratedSlug;

      return {
        ...current,
        title,
        slug: shouldUpdateSlug
          ? createSlug(title)
          : current.slug,
      };
    });
  };

  const handleTextChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const target = event.target;
    const { name, value } = target;

    setFormError("");

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setForm((current) => ({
        ...current,
        featured: target.checked,
      }));

      return;
    }

    if (name === "views") {
      setForm((current) => ({
        ...current,
        views: Number(value) || 0,
      }));

      return;
    }

    if (name === "display_order") {
      setForm((current) => ({
        ...current,
        display_order: Number(value) || 0,
      }));

      return;
    }

    if (name === "category_id") {
      setForm((current) => ({
        ...current,
        category_id: value,
        subcategory_id: null,
      }));

      return;
    }

    if (name === "subcategory_id") {
      setForm((current) => ({
        ...current,
        subcategory_id: value || null,
      }));

      return;
    }

    if (name === "video_source") {
      setForm((current) => ({
        ...current,
        video_source: value as VideoFormValues["video_source"],
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleTagsChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setTagsInput(event.target.value);
    setFormError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const title = form.title.trim();
    const slug =
      form.slug.trim() || createSlug(title);
    const description = form.description.trim();
    const videoUrl = form.video_url.trim();
    const thumbnailUrl =
      form.thumbnail_url.trim();
    const categoryId = form.category_id.trim();

    if (!title) {
      setFormError("Video title is required.");
      return;
    }

    if (!slug) {
      setFormError("Video slug is required.");
      return;
    }

    if (!description) {
      setFormError(
        "Video description is required."
      );
      return;
    }

    if (!videoUrl) {
      setFormError("Video URL is required.");
      return;
    }

    if (!categoryId) {
      setFormError("Please select a category.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const values: VideoFormValues = {
      title,
      slug,
      description,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      video_source: form.video_source,
      category_id: categoryId,
      subcategory_id:
        form.subcategory_id || null,
      featured: form.featured,
      views: Number(form.views) || 0,
      display_order:
        Number(form.display_order) || 0,
      tags,
    };

    try {
      setFormError("");
      await onSubmit(values);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save the video."
      );
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6"
    >
      {formError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {formError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Video Title
          </label>

          <input
            id="title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Enter video title"
            required
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Slug
          </label>

          <input
            id="slug"
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleTextChange}
            placeholder="video-title"
            required
            disabled={loading}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleTextChange}
          rows={5}
          placeholder="Write a description for the video"
          required
          disabled={loading}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="video_url"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Video URL
          </label>

          <input
            id="video_url"
            type="url"
            name="video_url"
            value={form.video_url}
            onChange={handleTextChange}
            placeholder="https://youtube.com/watch?v=..."
            required
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="thumbnail_url"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Thumbnail URL
          </label>

          <input
            id="thumbnail_url"
            type="url"
            name="thumbnail_url"
            value={form.thumbnail_url}
            onChange={handleTextChange}
            placeholder="https://example.com/thumbnail.jpg"
            disabled={loading}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label
            htmlFor="video_source"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Video Source
          </label>

          <select
            id="video_source"
            name="video_source"
            value={form.video_source}
            onChange={handleTextChange}
            disabled={loading}
            className={inputClass}
          >
            <option value="youtube">
              YouTube
            </option>

            <option value="vimeo">
              Vimeo
            </option>

            <option value="google_drive">
              Google Drive
            </option>

            <option value="direct">
              Direct URL
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category_id"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Category
          </label>

          <select
            id="category_id"
            name="category_id"
            value={form.category_id}
            onChange={handleTextChange}
            required
            disabled={loading}
            className={inputClass}
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
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Subcategory
          </label>

          <select
            id="subcategory_id"
            name="subcategory_id"
            value={form.subcategory_id ?? ""}
            onChange={handleTextChange}
            disabled={
              loading || !form.category_id
            }
            className={inputClass}
          >
            <option value="">
              No subcategory
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
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Tags
        </label>

        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={handleTagsChange}
          placeholder="editing, commercial, animation"
          disabled={loading}
          className={inputClass}
        />

        <p className="mt-2 text-xs text-zinc-500">
          Separate each tag with a comma.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="views"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Views
          </label>

          <input
            id="views"
            type="number"
            name="views"
            value={form.views}
            onChange={handleTextChange}
            min="0"
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="display_order"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Display Order
          </label>

          <input
            id="display_order"
            type="number"
            name="display_order"
            value={form.display_order}
            onChange={handleTextChange}
            min="0"
            disabled={loading}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-4">
        <input
          type="checkbox"
          name="featured"
          checked={form.featured}
          onChange={handleTextChange}
          disabled={loading}
          className="h-4 w-4 accent-amber-400"
        />

        <div>
          <p className="text-sm font-medium text-white">
            Featured video
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Display this video in featured sections.
          </p>
        </div>
      </label>

      {form.thumbnail_url && (
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-300">
            Thumbnail Preview
          </p>

          <div className="aspect-video max-w-md overflow-hidden rounded-xl border border-white/10 bg-black">
            <img
              src={form.thumbnail_url}
              alt="Thumbnail preview"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/10 px-5 py-3 font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}