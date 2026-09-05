import { useMemo } from "react";
import type { VideoSource } from "../../types/video";

interface VideoPlayerProps {
  url: string;
  title: string;
  source?: VideoSource;
  poster?: string;
  autoplay?: boolean;
  className?: string;
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : url;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId =
        parsedUrl.searchParams.get("v") ||
        parsedUrl.pathname.split("/").filter(Boolean).pop();

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : url;
    }

    return url;
  } catch {
    return url;
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .pop();

    return videoId
      ? `https://player.vimeo.com/video/${videoId}`
      : url;
  } catch {
    return url;
  }
}

function getGoogleDriveEmbedUrl(url: string) {
  try {
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    const idMatch = url.match(/[?&]id=([^&]+)/);

    const fileId = fileMatch?.[1] ?? idMatch?.[1];

    return fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : url;
  } catch {
    return url;
  }
}

function detectVideoSource(url: string): VideoSource {
  const normalizedUrl = url.toLowerCase();

  if (
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (normalizedUrl.includes("vimeo.com")) {
    return "vimeo";
  }

  if (normalizedUrl.includes("drive.google.com")) {
    return "google_drive";
  }

  return "direct";
}

export default function VideoPlayer({
  url,
  title,
  source,
  poster,
  autoplay = false,
  className = "",
}: VideoPlayerProps) {
  const videoSource = source ?? detectVideoSource(url);

  const embedUrl = useMemo(() => {
    switch (videoSource) {
      case "youtube": {
        const youtubeUrl = getYouTubeEmbedUrl(url);

        return autoplay
          ? `${youtubeUrl}${
              youtubeUrl.includes("?") ? "&" : "?"
            }autoplay=1`
          : youtubeUrl;
      }

      case "vimeo": {
        const vimeoUrl = getVimeoEmbedUrl(url);

        return autoplay
          ? `${vimeoUrl}${
              vimeoUrl.includes("?") ? "&" : "?"
            }autoplay=1`
          : vimeoUrl;
      }

      case "google_drive":
        return getGoogleDriveEmbedUrl(url);

      default:
        return url;
    }
  }, [url, videoSource, autoplay]);

  if (!url.trim()) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-sm text-zinc-500 ${className}`}
      >
        Video URL is unavailable.
      </div>
    );
  }

  if (videoSource === "direct") {
    return (
      <div
        className={`aspect-video overflow-hidden rounded-xl border border-white/10 bg-black ${className}`}
      >
        <video
          src={embedUrl}
          poster={poster}
          controls
          autoPlay={autoplay}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        >
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  return (
    <div
      className={`aspect-video overflow-hidden rounded-xl border border-white/10 bg-black ${className}`}
    >
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}