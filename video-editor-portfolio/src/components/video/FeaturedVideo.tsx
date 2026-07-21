import { motion } from "framer-motion";
import { ArrowRight, Eye, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

import type { Video } from "../../types/video";

interface FeaturedVideoProps {
  video: Video;
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

export default function FeaturedVideo({
  video,
}: FeaturedVideoProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <div className="grid min-h-[520px] lg:grid-cols-2">
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.55,
          }}
          className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-14"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Star
                size={13}
                fill="currentColor"
              />
              Featured Project
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize text-zinc-300">
              {video.video_source.replace("_", " ")}
            </span>
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-zinc-500">
            {video.category?.name ?? "Portfolio Work"}
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {video.title}
          </h2>

          <p className="mt-5 line-clamp-4 max-w-xl leading-8 text-zinc-400">
            {video.description ||
              "Explore this featured video editing project and discover the creative process behind the final result."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Eye size={17} />
              {formatViews(video.views)} views
            </span>

            {video.subcategory?.name && (
              <span>
                {video.subcategory.name}
              </span>
            )}
          </div>

          {video.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {video.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/videos/${video.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              <Play
                size={18}
                fill="currentColor"
              />
              Watch Project
            </Link>

            <Link
              to={`/videos/${video.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              View Details
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            scale: 1.05,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.65,
          }}
          className="relative min-h-[340px] overflow-hidden lg:min-h-full"
        >
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/1200x900?text=Featured+Video";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent lg:from-zinc-950 lg:via-zinc-950/10" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              to={`/videos/${video.slug}`}
              aria-label={`Play ${video.title}`}
              className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white hover:text-black"
            >
              <Play
                size={30}
                fill="currentColor"
                className="ml-1"
              />
            </Link>
          </div>

          <div className="absolute bottom-5 right-5 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
            {formatViews(video.views)} views
          </div>
        </motion.div>
      </div>
    </section>
  );
}