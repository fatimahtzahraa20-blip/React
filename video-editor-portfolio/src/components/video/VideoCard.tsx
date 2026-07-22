import { motion } from "framer-motion";
import { Eye, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

import type { Video } from "../../types/video";

interface VideoCardProps {
  video: Video;
  index?: number;
}

function formatViews(views: number) {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }

  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }

  return views.toString();
}

export default function VideoCard({
  video,
  index = 0,
}: VideoCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-white/20"
    >
      <Link
        to={`/videos/${video.slug}`}
        className="block"
      >
        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/800x450?text=Video";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
              <Play
                size={22}
                fill="currentColor"
                className="ml-1"
              />
            </div>
          </div>

          {video.featured && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-black/60 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Star
                size={13}
                fill="currentColor"
              />
              Featured
            </span>
          )}

          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-sm">
            <Eye size={13} />
            {formatViews(video.views)}
          </span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>
              {video.category?.name ?? "Uncategorized"}
            </span>

            {video.subcategory?.name && (
              <>
                <span>•</span>
                <span>{video.subcategory.name}</span>
              </>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug text-white transition group-hover:text-zinc-200">
            {video.title}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
            {video.description ||
              "View this video project and learn more about the work."}
          </p>

          {video.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {video.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}

              {video.tags.length > 3 && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-500">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-white">
              View project
            </span>

            <span className="text-xs capitalize text-zinc-500">
              {video.video_source.replace("_", " ")}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}