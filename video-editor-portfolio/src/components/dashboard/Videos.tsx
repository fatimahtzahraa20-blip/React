import { useMemo, useState } from "react";
import {
  Edit,
  Eye,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import VideoForm from "../forms/VideoForm";
import useCategories from "../../hooks/useCategories";
import useSubCategories from "../../hooks/useSubCategories";
import useVideos from "../../hooks/useVideos";

import type { Video } from "../../types/video";
import type { VideoFormValues } from "../../schemas/video.schema";

export default function Videos() {
  const {
    videos,
    loading: videosLoading,
    error: videosError,
    createVideo,
    creatingVideo,
    editVideo,
    updatingVideo,
    removeVideo,
    deletingVideo,
  } = useVideos();

  const {
    categories,
    loading: categoriesLoading,
  } = useCategories();

  const {
    subCategories,
    loading: subCategoriesLoading,
  } = useSubCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");
  const [selectedSubCategory, setSelectedSubCategory] =
    useState("");
  const [selectedSource, setSelectedSource] =
    useState("");
  const [featuredFilter, setFeaturedFilter] =
    useState<"all" | "featured" | "normal">("all");

  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] =
    useState<Video | null>(null);
  const [previewVideo, setPreviewVideo] =
    useState<Video | null>(null);

  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const filteredSubCategories = useMemo(() => {
    if (!selectedCategory) {
      return subCategories;
    }

    return subCategories.filter(
      (subCategory) =>
        subCategory.category_id === selectedCategory
    );
  }, [subCategories, selectedCategory]);

  const filteredVideos = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !normalizedSearch ||
        video.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        video.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        video.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        video.category?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        video.subcategory?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        video.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      const matchesCategory =
        !selectedCategory ||
        video.category_id === selectedCategory;

      const matchesSubCategory =
        !selectedSubCategory ||
        video.subcategory_id === selectedSubCategory;

      const matchesSource =
        !selectedSource ||
        video.video_source === selectedSource;

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" &&
          video.featured) ||
        (featuredFilter === "normal" &&
          !video.featured);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesSource &&
        matchesFeatured
      );
    });
  }, [
    videos,
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    selectedSource,
    featuredFilter,
  ]);

  const openCreateForm = () => {
    setEditingVideo(null);
    setActionError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (video: Video) => {
    setEditingVideo(video);
    setActionError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setActionError("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedSource("");
    setFeaturedFilter("all");
  };

  const handleCategoryFilterChange = (
    categoryId: string
  ) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
  };

  const handleSubmit = async (
    values: VideoFormValues
  ) => {
    try {
      setActionError("");
      setSuccessMessage("");

      const videoData = {
        ...values,
        subcategory_id:
          values.subcategory_id || null,
        tags: values.tags ?? [],
      };

      if (editingVideo) {
        await editVideo({
          id: editingVideo.id,
          video: videoData,
        });

        setSuccessMessage(
          "Video updated successfully."
        );
      } else {
        await createVideo(videoData);

        setSuccessMessage(
          "Video created successfully."
        );
      }

      closeForm();
    } catch (submitError) {
      setActionError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the video."
      );
    }
  };

  const handleDelete = async (video: Video) => {
    const confirmed = window.confirm(
      `Delete "${video.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");

      await removeVideo(video.id);

      if (editingVideo?.id === video.id) {
        closeForm();
      }

      if (previewVideo?.id === video.id) {
        setPreviewVideo(null);
      }

      setSuccessMessage(
        "Video deleted successfully."
      );
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the video."
      );
    }
  };

  const formatViews = (views: number) => {
    return new Intl.NumberFormat("en", {
      notation: views >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(views);
  };

  const isSaving =
    creatingVideo || updatingVideo;

  const pageLoading =
    videosLoading ||
    categoriesLoading ||
    subCategoriesLoading;
      return (
    <section className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Videos
            </h1>

            <p className="mt-2 text-zinc-400">
              Add, edit, organize, preview, and delete portfolio videos.
            </p>
          </div>

          <button
            type="button"
            onClick={
              showForm && !editingVideo
                ? closeForm
                : openCreateForm
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            {showForm && !editingVideo ? (
              <>
                <X size={18} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Video
              </>
            )}
          </button>
        </div>

        {(actionError || videosError) && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError || videosError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {showForm && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingVideo
                    ? "Edit Video"
                    : "Create Video"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {editingVideo
                    ? "Update the selected video information."
                    : "Add a new video to your portfolio."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close video form"
              >
                <X size={20} />
              </button>
            </div>

            <VideoForm
              categories={categories}
              subCategories={subCategories}
              defaultValues={
                editingVideo
                  ? {
                      title: editingVideo.title,
                      slug: editingVideo.slug,
                      description:
                        editingVideo.description,
                      video_url:
                        editingVideo.video_url,
                      thumbnail_url:
                        editingVideo.thumbnail_url,
                      video_source:
                        editingVideo.video_source,
                      category_id:
                        editingVideo.category_id,
                      subcategory_id:
                        editingVideo.subcategory_id,
                      featured:
                        editingVideo.featured,
                      views: editingVideo.views,
                      display_order:
                        editingVideo.display_order,
                      tags: editingVideo.tags ?? [],
                    }
                  : undefined
              }
              loading={isSaving}
              submitLabel={
                editingVideo
                  ? "Update Video"
                  : "Create Video"
              }
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-950 p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by title, slug, description, category, or tags..."
                className="w-full rounded-lg border border-white/10 bg-black py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                htmlFor="video-category-filter"
                className="mb-2 block text-sm text-zinc-400"
              >
                Category
              </label>

              <select
                id="video-category-filter"
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryFilterChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              >
                <option value="">All categories</option>

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
                htmlFor="video-subcategory-filter"
                className="mb-2 block text-sm text-zinc-400"
              >
                Subcategory
              </label>

              <select
                id="video-subcategory-filter"
                value={selectedSubCategory}
                onChange={(event) =>
                  setSelectedSubCategory(
                    event.target.value
                  )
                }
                disabled={
                  filteredSubCategories.length === 0
                }
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  All subcategories
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

            <div>
              <label
                htmlFor="video-source-filter"
                className="mb-2 block text-sm text-zinc-400"
              >
                Video Source
              </label>

              <select
                id="video-source-filter"
                value={selectedSource}
                onChange={(event) =>
                  setSelectedSource(event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              >
                <option value="">All sources</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
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
                htmlFor="video-featured-filter"
                className="mb-2 block text-sm text-zinc-400"
              >
                Featured Status
              </label>

              <select
                id="video-featured-filter"
                value={featuredFilter}
                onChange={(event) =>
                  setFeaturedFilter(
                    event.target.value as
                      | "all"
                      | "featured"
                      | "normal"
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              >
                <option value="all">
                  All videos
                </option>
                <option value="featured">
                  Featured only
                </option>
                <option value="normal">
                  Non-featured only
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {filteredVideos.length} of{" "}
            {videos.length} videos
          </p>

          <p>
            {videos.filter((video) => video.featured).length}{" "}
            featured videos
          </p>
        </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          {pageLoading ? (
            <div className="flex min-h-80 items-center justify-center text-zinc-400">
              Loading videos...
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <Eye
                size={40}
                className="text-zinc-600"
              />

              <h2 className="mt-4 text-lg font-semibold">
                No videos found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Add a new video or change the current search and filter options.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
              >
                <Plus size={17} />
                Add Video
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr className="text-left text-sm text-zinc-400">
                    <th className="px-5 py-4 font-medium">
                      Video
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Category
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Source
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Views
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Order
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVideos.map((video) => (
                    <tr
                      key={video.id}
                      className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[320px] items-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewVideo(video)
                            }
                            className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black"
                          >
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://placehold.co/320x180?text=Video";
                              }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                              <Eye size={20} />
                            </div>
                          </button>

                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-white">
                              {video.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                              /{video.slug}
                            </p>

                            <p className="mt-2 line-clamp-2 max-w-sm text-sm leading-5 text-zinc-400">
                              {video.description}
                            </p>

                            {video.tags?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {video.tags
                                  .slice(0, 3)
                                  .map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-500"
                                    >
                                      {tag}
                                    </span>
                                  ))}

                                {video.tags.length > 3 && (
                                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-500">
                                    +{video.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-200">
                          {video.category?.name ??
                            "Unassigned"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {video.subcategory?.name ??
                            "No subcategory"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium capitalize text-zinc-300">
                          {video.video_source.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {formatViews(video.views)}
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {video.display_order}
                      </td>

                      <td className="px-5 py-4">
                        {video.featured ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                            <Star
                              size={13}
                              fill="currentColor"
                            />
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewVideo(video)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                          >
                            <Eye size={16} />
                            Preview
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(video)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                          >
                            <Edit size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(video)
                            }
                            disabled={deletingVideo}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
                {previewVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
            onClick={() => setPreviewVideo(null)}
          >
            <div
              className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                    Video Preview
                  </p>

                  <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                    {previewVideo.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewVideo(null)}
                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close video preview"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-5">
                <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                  {previewVideo.video_source === "direct" ? (
                    <video
                      src={previewVideo.video_url}
                      controls
                      poster={previewVideo.thumbnail_url}
                      className="h-full w-full object-contain"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <iframe
                      src={previewVideo.video_url}
                      title={previewVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  )}
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black p-5">
                    <h3 className="font-semibold text-white">
                      Video Information
                    </h3>

                    <dl className="mt-4 space-y-4 text-sm">
                      <div>
                        <dt className="text-zinc-500">
                          Category
                        </dt>

                        <dd className="mt-1 text-zinc-200">
                          {previewVideo.category?.name ??
                            "Unassigned"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-zinc-500">
                          Subcategory
                        </dt>

                        <dd className="mt-1 text-zinc-200">
                          {previewVideo.subcategory?.name ??
                            "No subcategory"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-zinc-500">
                          Source
                        </dt>

                        <dd className="mt-1 capitalize text-zinc-200">
                          {previewVideo.video_source.replace(
                            "_",
                            " "
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-zinc-500">
                          Views
                        </dt>

                        <dd className="mt-1 text-zinc-200">
                          {formatViews(previewVideo.views)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-zinc-500">
                          Display Order
                        </dt>

                        <dd className="mt-1 text-zinc-200">
                          {previewVideo.display_order}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black p-5">
                    <h3 className="font-semibold text-white">
                      Description
                    </h3>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                      {previewVideo.description}
                    </p>

                    {previewVideo.tags?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm text-zinc-500">
                          Tags
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {previewVideo.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <a
                    href={previewVideo.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye size={18} />
                    Open Original
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewVideo(null);
                      openEditForm(previewVideo);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
                  >
                    <Edit size={18} />
                    Edit Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}