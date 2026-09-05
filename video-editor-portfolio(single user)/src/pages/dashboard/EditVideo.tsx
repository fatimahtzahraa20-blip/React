import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  logVideoDeleted,
  logVideoUpdated,
} from "../../lib/activityLogger";
import { notifyVideoDecision } from "../../lib/notificationService";
import supabase from "../../lib/supabase";

type Category = {
  id: string | number;
  name: string;
};

type SubCategory = {
  id: string | number;
  name: string;
  category_id: string | number | null;
};

type VideoRecord = {
  id: string | number;
  title: string | null;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  video_source: string | null;
  cloudinary_video_public_id: string | null;
  cloudinary_thumbnail_public_id: string | null;
  category_id: string | number | null;
  sub_category_id: string | number | null;
  user_id: string | null;
  approval_status: string | null;
  created_at: string | null;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function uploadToCloudinary(
  file: File,
  resourceType: "video" | "image",
  onProgress: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration is missing from the .env file."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "video-editor-portfolio");

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
    );

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress(progress);
    });

    request.addEventListener("load", () => {
      try {
        const response = JSON.parse(request.responseText);

        if (request.status < 200 || request.status >= 300) {
          reject(
            new Error(
              response?.error?.message ||
                "Cloudinary upload failed."
            )
          );

          return;
        }

        resolve(response as CloudinaryUploadResponse);
      } catch {
        reject(
          new Error("Cloudinary returned an invalid response.")
        );
      }
    });

    request.addEventListener("error", () => {
      reject(
        new Error("A network error occurred during upload.")
      );
    });

    request.send(formData);
  });
}

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, profile } = useAuth();

  const [video, setVideo] = useState<VideoRecord | null>(
    null
  );

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [subCategories, setSubCategories] = useState<
    SubCategory[]
  >([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [videoSource, setVideoSource] = useState<
    "cloudinary" | "youtube" | "google_drive" | "direct_url"
  >("direct_url");

  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [approvalStatus, setApprovalStatus] =
    useState("pending");

  const [newVideoFile, setNewVideoFile] =
    useState<File | null>(null);

  const [newThumbnailFile, setNewThumbnailFile] =
    useState<File | null>(null);

  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = true;

  useEffect(() => {
    const loadPageData = async () => {
      if (!id || !user) {
        setError("The requested video could not be found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");
      setError("");

      const [
        videoResult,
        categoryResult,
        subCategoryResult,
      ] = await Promise.all([
        supabase
          .from("videos")
          .select(
            `
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              video_source,
              cloudinary_video_public_id,
              cloudinary_thumbnail_public_id,
              category_id,
              sub_category_id,
              user_id,
              approval_status,
              created_at
            `
          )
          .eq("id", id)
          .single(),

        supabase
          .from("categories")
          .select("id, name")
          .order("name"),

        supabase
          .from("sub_categories")
          .select("id, name, category_id")
          .order("name"),
      ]);

      if (videoResult.error || !videoResult.data) {
        setError(
          videoResult.error?.message || "Video not found."
        );

        setLoading(false);
        return;
      }

      const loadedVideo =
        videoResult.data as VideoRecord;

      const ownsVideo =
        loadedVideo.user_id === user.id;

      if (!isAdmin && !ownsVideo) {
        setError(
          "You do not have permission to edit this video."
        );

        setLoading(false);
        return;
      }

      setVideo(loadedVideo);

      setTitle(loadedVideo.title ?? "");
      setDescription(loadedVideo.description ?? "");
      setVideoUrl(loadedVideo.video_url ?? "");
      setThumbnailUrl(loadedVideo.thumbnail_url ?? "");

      setVideoSource(
        loadedVideo.video_source === "cloudinary" ||
          loadedVideo.video_source === "youtube" ||
          loadedVideo.video_source === "google_drive"
          ? loadedVideo.video_source
          : "direct_url"
      );

      setCategoryId(
        loadedVideo.category_id === null
          ? ""
          : String(loadedVideo.category_id)
      );

      setSubCategoryId(
        loadedVideo.sub_category_id === null
          ? ""
          : String(loadedVideo.sub_category_id)
      );

      setApprovalStatus(
        loadedVideo.approval_status ?? "pending"
      );

      if (categoryResult.error) {
        setError(categoryResult.error.message);
      } else {
        setCategories(
          (categoryResult.data ?? []) as Category[]
        );
      }

      if (subCategoryResult.error) {
        setError(subCategoryResult.error.message);
      } else {
        setSubCategories(
          (subCategoryResult.data ??
            []) as SubCategory[]
        );
      }

      setLoading(false);
    };

    void loadPageData();
  }, [id, user, isAdmin]);

  const visibleSubCategories = subCategories.filter(
    (subCategory) => {
      if (!categoryId) {
        return true;
      }

      return (
        String(subCategory.category_id) === categoryId
      );
    }
  );

  const handleVideoFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setNewVideoFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("The video must be smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setNewVideoFile(file);
    setVideoSource("cloudinary");
  };

  const handleThumbnailFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setNewThumbnailFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid thumbnail image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "The thumbnail must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setNewThumbnailFile(file);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubCategoryId("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
        event.preventDefault();

    if (!video || !user) {
      setError("Video information is unavailable.");
      return;
    }

    if (!title.trim()) {
      setError("Video title is required.");
      return;
    }

    if (!videoUrl.trim() && !newVideoFile) {
      setError("Provide a video URL or select a new video file.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setVideoProgress(0);
    setThumbnailProgress(0);

    try {
      let finalVideoUrl = videoUrl.trim();
      let finalThumbnailUrl = thumbnailUrl.trim();

      let cloudinaryVideoPublicId =
        video.cloudinary_video_public_id;

      let cloudinaryThumbnailPublicId =
        video.cloudinary_thumbnail_public_id;

      let finalVideoSource = videoSource;

      if (newVideoFile) {
        const uploadedVideo = await uploadToCloudinary(
          newVideoFile,
          "video",
          setVideoProgress
        );

        finalVideoUrl = uploadedVideo.secure_url;
        cloudinaryVideoPublicId = uploadedVideo.public_id;
        finalVideoSource = "cloudinary";
      }

      if (newThumbnailFile) {
        const uploadedThumbnail = await uploadToCloudinary(
          newThumbnailFile,
          "image",
          setThumbnailProgress
        );

        finalThumbnailUrl = uploadedThumbnail.secure_url;
        cloudinaryThumbnailPublicId =
          uploadedThumbnail.public_id;
      }

      const nextApprovalStatus = isAdmin
        ? approvalStatus
        : "pending";

      const { error: updateError } = await supabase
        .from("videos")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          video_url: finalVideoUrl,
          thumbnail_url: finalThumbnailUrl || null,
          video_source: finalVideoSource,
          cloudinary_video_public_id:
            cloudinaryVideoPublicId,
          cloudinary_thumbnail_public_id:
            cloudinaryThumbnailPublicId,
          category_id: categoryId || null,
          sub_category_id: subCategoryId || null,
          approval_status: nextApprovalStatus,
        })
        .eq("id", video.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      await logVideoUpdated(
        video.id,
        title.trim(),
        user.id
      );

      if (
        isAdmin &&
        video.user_id &&
        nextApprovalStatus !== video.approval_status &&
        (nextApprovalStatus === "approved" ||
          nextApprovalStatus === "rejected")
      ) {
        await notifyVideoDecision(
          video.user_id,
          title.trim(),
          nextApprovalStatus === "approved"
        );
      }

      setMessage(
        isAdmin
          ? "Video updated successfully."
          : "Video updated successfully and sent back for administrator approval."
      );

      window.setTimeout(() => {
        navigate(
          isAdmin
            ? "/admin/videos"
            : "/dashboard/videos",
          { replace: true }
        );
      }, 1300);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "The video could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!video || !user) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${video.title || "this video"}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await logVideoDeleted(
      video.id,
      video.title,
      user.id
    );

    navigate(
      isAdmin
        ? "/admin/videos"
        : "/dashboard/videos",
      { replace: true }
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <p>Loading video...</p>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">
            Unable to Edit Video
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error || "Video not found."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Video Management
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit Video
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Update video details, source, thumbnail, category,
            and approval status.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="edit-title"
                className="mb-2 block text-sm font-medium"
              >
                Video title
              </label>

              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
                required
              />
            </div>

            <div>
              <label
                htmlFor="edit-description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="edit-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label
                htmlFor="video-source"
                className="mb-2 block text-sm font-medium"
              >
                Video source
              </label>

              <select
                id="video-source"
                value={videoSource}
                onChange={(event) =>
                  setVideoSource(
                    event.target.value as
                      | "cloudinary"
                      | "youtube"
                      | "google_drive"
                      | "direct_url"
                  )
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="direct_url">
                  Direct URL
                </option>
                <option value="youtube">
                  YouTube
                </option>
                <option value="google_drive">
                  Google Drive
                </option>
                <option value="cloudinary">
                  Cloudinary
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-video-url"
                className="mb-2 block text-sm font-medium"
              >
                Video URL
              </label>

              <input
                id="edit-video-url"
                type="url"
                value={videoUrl}
                onChange={(event) =>
                  setVideoUrl(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label
                htmlFor="new-video-file"
                className="mb-2 block text-sm font-medium"
              >
                Replace video file
              </label>

              <input
                id="new-video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              {newVideoFile && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {newVideoFile.name}
                </p>
              )}

              {saving && videoProgress > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Video upload</span>
                    <span>{videoProgress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{
                        width: `${videoProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-thumbnail-url"
                className="mb-2 block text-sm font-medium"
              >
                Thumbnail URL
              </label>

              <input
                id="edit-thumbnail-url"
                type="url"
                value={thumbnailUrl}
                onChange={(event) =>
                  setThumbnailUrl(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label
                htmlFor="new-thumbnail-file"
                className="mb-2 block text-sm font-medium"
              >
                Replace thumbnail image
              </label>

              <input
                id="new-thumbnail-file"
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className="w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              {newThumbnailFile && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {newThumbnailFile.name}
                </p>
              )}

              {saving && thumbnailProgress > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Thumbnail upload</span>
                    <span>{thumbnailProgress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{
                        width: `${thumbnailProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="edit-category"
                  value={categoryId}
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-sub-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Subcategory
                </label>

                <select
                  id="edit-sub-category"
                  value={subCategoryId}
                  onChange={(event) =>
                    setSubCategoryId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">
                    Select subcategory
                  </option>

                  {visibleSubCategories.map(
                    (subCategory) => (
                      <option
                        key={subCategory.id}
                        value={String(
                          subCategory.id
                        )}
                      >
                        {subCategory.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {isAdmin && (
              <div>
                <label
                  htmlFor="approval-status"
                  className="mb-2 block text-sm font-medium"
                >
                  Approval status
                </label>

                <select
                  id="approval-status"
                  value={approvalStatus}
                  onChange={(event) =>
                    setApprovalStatus(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="pending">
                    Pending
                  </option>
                  <option value="approved">
                    Approved
                  </option>
                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            )}

            {thumbnailUrl && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Current thumbnail
                </p>

                <img
                  src={thumbnailUrl}
                  alt={title || "Video thumbnail"}
                  className="aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                />
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={saving || deleting}
                  className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:opacity-60 dark:border-zinc-700"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving || deleting}
                className="rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Video"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
