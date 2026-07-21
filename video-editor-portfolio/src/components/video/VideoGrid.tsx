import type { Video } from "../../types/video";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function VideoGrid({
  videos,
  loading = false,
  emptyMessage = "No videos found.",
}: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
          >
            <div className="aspect-video animate-pulse bg-zinc-900" />

            <div className="space-y-4 p-5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-800" />

              <div className="h-6 w-4/5 animate-pulse rounded bg-zinc-800" />

              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-900" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-900" />
              </div>

              <div className="flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-900" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-900" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 text-center">
        <div>
          <h3 className="text-xl font-semibold text-white">
            No videos available
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          index={index}
        />
      ))}
    </div>
  );
}