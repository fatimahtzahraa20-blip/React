import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Search, Sparkles, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  video_source: "youtube" | "google_drive" | "supabase";
  category_id: string | null;
  subcategory_id: string | null;
  featured: boolean;
  views: number;
  tags: string[] | null;
  created_at: string;
  categories: { name: string; slug: string } | null;
  sub_categories: { name: string } | null;
}

const containerAnimation = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      setErrorMessage("");

      const [videosResult, categoriesResult] = await Promise.all([
        supabase
          .from("videos")
          .select(`
            id, title, slug, description, thumbnail_url, video_source,
            category_id, subcategory_id, featured, views, tags, created_at,
            categories (name, slug), sub_categories (name)
          `)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, slug, description")
          .order("name", { ascending: true }),
      ]);

      if (videosResult.error) {
        setErrorMessage(videosResult.error.message);
        setLoading(false);
        return;
      }
      if (categoriesResult.error) {
        setErrorMessage(categoriesResult.error.message);
        setLoading(false);
        return;
      }

      setVideos((videosResult.data ?? []) as unknown as VideoItem[]);
      setCategories(categoriesResult.data ?? []);
      setLoading(false);
    };

    void loadPortfolioData();
  }, []);

  const featuredVideos = useMemo(
    () => videos.filter((video) => video.featured).slice(0, 3),
    [videos]
  );

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase();
      result = result.filter((video) => {
        const titleMatch = video.title.toLowerCase().includes(normalizedSearch);
        const descriptionMatch = video.description?.toLowerCase().includes(normalizedSearch) ?? false;
        const tagMatch = video.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearch)) ?? false;
        return titleMatch || descriptionMatch || tagMatch;
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((video) => video.category_id === selectedCategory);
    }

    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    } else if (sortBy === "views") {
      result.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }

    return result;
  }, [videos, searchTerm, selectedCategory, sortBy]);

  return (
    <main className="overflow-hidden bg-black text-white">
      {/* HERO SECTION */}
      <section className="relative flex min-h-screen items-center px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2"
        >
          <div>
            <motion.div
              variants={itemAnimation}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl"
            >
              <Sparkles size={16} className="text-purple-400" />
              Professional Video Editor
            </motion.div>

            <motion.h1
              variants={itemAnimation}
              className="max-w-4xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl"
            >
              Stories brought to life through{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                powerful visuals.
              </span>
            </motion.h1>

            <motion.p
              variants={itemAnimation}
              className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400"
            >
              I create engaging YouTube videos, cinematic edits, short-form content, commercial advertisements and motion graphics that connect with audiences.
            </motion.p>

            <motion.div
              variants={itemAnimation}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-4 font-semibold text-black transition hover:scale-105 hover:bg-zinc-200"
              >
                View My Work
                <ArrowRight size={18} />
              </a>

              {/* ✅ FIXED: Ab ye button solid white background aur black text ke sath hai, bilkul clear aur readable */}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-4 font-semibold text-black transition hover:bg-zinc-200"
              >
                Start a Project
              </Link>
            </motion.div>

            <motion.div
              variants={itemAnimation}
              className="mt-12 grid max-w-lg grid-cols-3 gap-5"
            >
              <div>
                <p className="text-3xl font-bold">{videos.length}+</p>
                <p className="mt-1 text-sm text-zinc-500">Projects</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{categories.length}+</p>
                <p className="mt-1 text-sm text-zinc-500">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="mt-1 text-sm text-zinc-500">Creativity</p>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemAnimation} className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl">
              {featuredVideos[0]?.thumbnail_url ? (
                <img
                  src={featuredVideos[0].thumbnail_url}
                  alt={featuredVideos[0].title}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                  <Video size={80} className="text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl">
                  <Play size={22} fill="currentColor" />
                </div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Featured Project</p>
                <h2 className="mt-2 text-2xl font-bold">
                  {featuredVideos[0]?.title ?? "Your next creative project"}
                </h2>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURED SECTION */}
      <section id="featured" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">Selected Projects</p>
            <h2 className="text-4xl font-bold sm:text-5xl">Featured Work</h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              A selection of creative projects designed to capture attention and tell memorable stories.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  <div className="aspect-video bg-zinc-800" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 rounded bg-zinc-800" />
                    <div className="h-4 w-2/3 rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredVideos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
              No featured videos are available yet.
            </div>
          ) : (
            <motion.div
              variants={containerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 lg:grid-cols-3"
            >
              {featuredVideos.map((video) => (
                <motion.article
                  key={video.id}
                  variants={itemAnimation}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition hover:-translate-y-2 hover:border-white/20"
                >
                  <Link to={`/videos/${video.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-zinc-800">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Video size={44} className="text-zinc-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <Play size={22} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">
                          {video.categories?.name ?? "Uncategorized"}
                        </span>
                        {video.sub_categories?.name && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                            {video.sub_categories.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold transition group-hover:text-purple-300">{video.title}</h3>
                      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
                        <span>{video.views ?? 0} views</span>
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="projects" className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Portfolio</p>
              <h2 className="text-4xl font-bold sm:text-5xl">Latest Projects</h2>
              <p className="mt-4 max-w-2xl text-zinc-400">Search and explore recent video editing projects by category.</p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search projects..."
                  className="w-full rounded-xl border border-white/10 bg-black py-3 pl-10 pr-4 outline-none transition focus:border-white/30"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
              >
                <option value="latest">Latest</option>
                <option value="featured">Featured</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  <div className="aspect-video bg-zinc-800" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 rounded bg-zinc-800" />
                    <div className="h-4 w-2/3 rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black p-12 text-center">
              <Video size={48} className="mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold">No projects found</h3>
              <p className="mt-2 text-zinc-500">Try changing the search or category filter.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.slice(0, 9).map((video) => (
                <motion.article
                  layout
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-black transition hover:-translate-y-2 hover:border-white/20"
                >
                  <Link to={`/videos/${video.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-zinc-900">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Video size={42} className="text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition group-hover:scale-110">
                        <Play size={18} fill="currentColor" />
                      </div>
                      {video.featured && (
                        <span className="absolute right-4 top-4 rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold">Featured</span>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-purple-300">{video.categories?.name ?? "Uncategorized"}</p>
                      <h3 className="mt-2 line-clamp-2 text-xl font-semibold">{video.title}</h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {video.description ?? "Professional video editing project."}
                      </p>
                      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
                        <span>{video.views ?? 0} views</span>
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">Explore My Work</p>
            <h2 className="text-4xl font-bold sm:text-5xl">Video Categories</h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Browse creative projects across different video editing styles.</p>
          </motion.div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
              No categories are available yet.
            </div>
          ) : (
            <motion.div
              variants={containerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {categories.map((category) => {
                const categoryVideoCount = videos.filter((video) => video.category_id === category.id).length;
                return (
                  <motion.button
                    key={category.id}
                    variants={itemAnimation}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group rounded-2xl border border-white/10 bg-zinc-900 p-6 text-left transition hover:-translate-y-1 hover:border-purple-500/40 hover:bg-zinc-800"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 transition group-hover:bg-purple-500 group-hover:text-white">
                      <Video size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {category.description ?? "Explore creative video projects from this category."}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        {categoryVideoCount} {categoryVideoCount === 1 ? "project" : "projects"}
                      </span>
                      <ArrowRight size={18} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">What I Do</p>
            <h2 className="text-4xl font-bold sm:text-5xl">Video Editing Services</h2>
            <p className="mt-4 max-w-2xl text-zinc-400">Professional editing solutions for brands, businesses, creators and social media platforms.</p>
          </motion.div>

          <motion.div
            variants={containerAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { title: "YouTube Video Editing", description: "Engaging long-form videos with clean cuts, subtitles, sound design, transitions and visual storytelling." },
              { title: "Short-Form Content", description: "Fast-paced Reels, TikToks and YouTube Shorts designed to capture attention and increase engagement." },
              { title: "Commercial Videos", description: "Professional advertisements and promotional videos that communicate your brand message clearly." },
              { title: "Social Media Content", description: "Platform-ready videos optimized for Instagram, Facebook, TikTok and other social channels." },
              { title: "Motion Graphics", description: "Animated text, titles, graphics and visual effects that make your content more dynamic." },
              { title: "Color and Audio Enhancement", description: "Color correction, color grading, noise reduction and audio balancing for a polished final result." },
            ].map((service, index) => (
              <motion.article
                key={service.title}
                variants={itemAnimation}
                className="rounded-2xl border border-white/10 bg-black p-7 transition hover:-translate-y-2 hover:border-white/20"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-black">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-4 leading-7 text-zinc-500">{service.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">About Me</p>
            <h2 className="text-4xl font-bold sm:text-5xl">I am Fatima Zara, a creative video editor.</h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              I transform raw footage into engaging visual stories. My goal is to create videos that are clear, attractive and meaningful while matching the style and purpose of each project.
            </p>
            <p className="mt-5 leading-8 text-zinc-500">
              I work with YouTube videos, short-form content, advertisements, promotional videos and social media projects. I focus on smooth editing, strong storytelling, clean visuals and professional presentation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
              >
                Learn More
                <ArrowRight size={18} />
              </Link>
              <a
                href="mailto:fatimahtzahraa2.0@gmail.com"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Email Me
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-zinc-900 p-7 sm:p-9"
          >
            <h3 className="text-2xl font-semibold">Editing Skills</h3>
            <div className="mt-8 space-y-6">
              {[
                { name: "Video Editing", level: 95 },
                { name: "Short-Form Content", level: 92 },
                { name: "Storytelling", level: 90 },
                { name: "Color Correction", level: 85 },
                { name: "Motion Graphics", level: 82 },
              ].map((skill) => (
                <div key={skill.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-zinc-500">{skill.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">Client Feedback</p>
            <h2 className="text-4xl font-bold sm:text-5xl">What Clients Say</h2>
          </motion.div>

          <motion.div
            variants={containerAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {[
              { review: "The final video was clean, engaging and professionally edited. The pacing and transitions made the content much stronger.", name: "YouTube Creator", project: "Long-Form Video" },
              { review: "The short videos were attractive and perfectly formatted for social media. Communication was also clear throughout the project.", name: "Social Media Client", project: "Reels and Shorts" },
              { review: "The advertisement looked polished and matched our brand style. The final delivery was creative and easy to publish.", name: "Business Client", project: "Promotional Video" },
            ].map((testimonial) => (
              <motion.article
                key={testimonial.name}
                variants={itemAnimation}
                className="rounded-2xl border border-white/10 bg-black p-7"
              >
                <div className="mb-5 text-4xl text-purple-400">“</div>
                <p className="leading-7 text-zinc-400">{testimonial.review}</p>
                <div className="mt-7 border-t border-white/10 pt-5">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{testimonial.project}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Common Questions</p>
            <h2 className="text-4xl font-bold sm:text-5xl">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { question: "What types of videos do you edit?", answer: "I edit YouTube videos, Reels, TikToks, Shorts, advertisements, promotional videos and other social media content." },
              { question: "How can I send my video files?", answer: "You can share your footage using Google Drive, Dropbox or another secure file-sharing platform." },
              { question: "How long does a project take?", answer: "Delivery time depends on the length and complexity of the project. A clear estimated timeline is provided before editing begins." },
              { question: "Do you provide revisions?", answer: "Yes. Revisions can be included according to the agreed project requirements so the final video matches your expectations." },
              { question: "Can you edit videos for different platforms?", answer: "Yes. Videos can be prepared in landscape, portrait or square formats for YouTube, Instagram, TikTok and Facebook." },
            ].map((item) => (
              <details key={item.question} className="group rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <summary className="cursor-pointer list-none font-semibold">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-2xl text-zinc-500 transition group-open:rotate-45">+</span>
                  </div>
                </summary>
                <p className="mt-4 leading-7 text-zinc-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 px-6 py-16 text-center sm:px-12"
        >
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[110px]" />
          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">Let Us Work Together</p>
            <h2 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">Have a video project in mind?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Contact Fatima Zara and share your project idea. Let us create something professional, engaging and memorable.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-4 font-semibold text-black transition hover:scale-105 hover:bg-zinc-200"
              >
                Start Your Project
                <ArrowRight size={18} />
              </Link>
              <a
                href="mailto:fatimahtzahraa2.0@gmail.com"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                fatimahtzahraa2.0@gmail.com
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}