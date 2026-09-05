import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Folder,
  Loader2,
  Tag,
  Video as VideoIcon,
} from "lucide-react";
import { FaGithub, FaYoutube } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

type VideoSource =
  | "supabase"
  | "youtube"
  | "google_drive"
  | "github"
  | "direct_url";

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  video_source: VideoSource;
  featured: boolean;
  views: number;
  tags: string[] | null;
  created_at: string;
  categories: {
    name: string;
    slug: string;
  } | null;
  sub_categories: {
    name: string;
  } | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function isIframeSource(source: VideoSource) {
  return source === "youtube" || source === "google_drive";
}

export default function VideoDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVideo() {
      if (!slug) {
        setErrorMessage("The video link is invalid.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          slug,
          description,
          thumbnail_url,
          video_url,
          video_source,
          featured,
          views,
          tags,
          created_at,
          categories (name, slug),
          sub_categories (name)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("This video could not be found.");
        setLoading(false);
        return;
      }

      const loadedVideo = data as unknown as VideoItem;
      setVideo(loadedVideo);
      setLoading(false);

      await supabase
        .from("videos")
        .update({ views: (loadedVideo.views ?? 0) + 1 })
        .eq("id", loadedVideo.id);
    }

    void loadVideo();
  }, [slug]);

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <Loader2 size={38} className="mx-auto animate-spin text-purple-500" />
          <p className={`mt-4 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Loading video...
          </p>
        </div>
      </main>
    );
  }

  if (!video || errorMessage) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center px-4 transition-colors duration-300 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div
          className={`max-w-lg rounded-2xl border p-10 text-center transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-zinc-950"
              : "border-black/10 bg-zinc-100"
          }`}
        >
          <VideoIcon
            size={52}
            className={`mx-auto ${isDark ? "text-zinc-700" : "text-zinc-400"}`}
          />

          <h1 className="mt-5 text-3xl font-bold">Video not available</h1>

          <p className={`mt-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {errorMessage || "The requested video could not be found."}
          </p>

          <Link
            to="/"
            className={`mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-black text-white hover:bg-zinc-800"
            }`}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-4 py-12 transition-colors duration-300 sm:px-6 lg:px-8 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className={`mb-8 inline-flex items-center gap-2 transition ${
            isDark
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          <ArrowLeft size={19} />
          Back to Portfolio
        </Link>

        <section
          className={`overflow-hidden rounded-3xl border transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-zinc-950"
              : "border-black/10 bg-zinc-100"
          }`}
        >
          <div className="aspect-video w-full bg-black">
            {isIframeSource(video.video_source) ? (
              <iframe
                src={video.video_url}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                src={video.video_url}
                controls
                poster={video.thumbnail_url ?? undefined}
                preload="metadata"
                playsInline
                className="h-full w-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-purple-500/15 px-4 py-2 text-sm font-medium text-purple-500">
                {video.categories?.name ?? "Uncategorized"}
              </span>

              {video.sub_categories?.name && (
                <span
                  className={`rounded-full border px-4 py-2 text-sm ${
                    isDark
                      ? "border-white/10 text-zinc-300"
                      : "border-black/10 text-zinc-700"
                  }`}
                >
                  {video.sub_categories.name}
                </span>
              )}

              {video.featured && (
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    isDark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                  }`}
                >
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              {video.title}
            </h1>

            <div
              className={`mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Eye size={17} />
                {(video.views ?? 0) + 1} views
              </span>

              <span className="inline-flex items-center gap-2">
                <Calendar size={17} />
                {formatDate(video.created_at)}
              </span>

              <span className="inline-flex items-center gap-2 capitalize">
                {video.video_source === "youtube" ? (
                  <FaYoutube size={17} />
                ) : video.video_source === "github" ? (
                  <FaGithub size={17} />
                ) : (
                  <Folder size={17} />
                )}
                {video.video_source.replace("_", " ")}
              </span>
            </div>

            <div
              className={`mt-8 border-t pt-8 ${
                isDark ? "border-white/10" : "border-black/10"
              }`}
            >
              <h2 className="text-xl font-semibold">About this project</h2>

              <p
                className={`mt-4 whitespace-pre-line leading-8 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {video.description ||
                  "A professionally edited video project from my portfolio."}
              </p>
            </div>

            {video.tags && video.tags.length > 0 && (
              <div
                className={`mt-8 border-t pt-8 ${
                  isDark ? "border-white/10" : "border-black/10"
                }`}
              >
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Tag size={20} />
                  Tags
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        isDark
                          ? "border-white/10 bg-black text-zinc-300"
                          : "border-black/10 bg-white text-zinc-700"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}