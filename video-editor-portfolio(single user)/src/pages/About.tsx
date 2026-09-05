import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Film,
  Layers,
  MonitorPlay,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

interface FeaturedVideo {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  categories: {
    name: string;
    slug: string;
  } | null;
}

const skills = [
  "Video Editing",
  "Color Grading",
  "Motion Graphics",
  "Sound Design",
  "Social Media Content",
  "YouTube Editing",
  "Commercial Editing",
  "Cinematic Storytelling",
];

const services = [
  {
    icon: Film,
    title: "Professional Video Editing",
    description:
      "Clean, engaging, and well-paced edits designed around your audience and project goals.",
  },
  {
    icon: Sparkles,
    title: "Motion Graphics",
    description:
      "Animated text, transitions, titles, and visual elements that make your videos more dynamic.",
  },
  {
    icon: MonitorPlay,
    title: "Social Media Content",
    description:
      "Short-form and long-form content optimized for YouTube, Instagram, TikTok, and other platforms.",
  },
  {
    icon: Layers,
    title: "Color and Sound",
    description:
      "Color correction, creative grading, audio cleaning, and sound design for a polished final result.",
  },
];

const statistics = [
  {
    icon: Film,
    value: "50+",
    label: "Completed projects",
  },
  {
    icon: Users,
    value: "20+",
    label: "Satisfied clients",
  },
  {
    icon: Award,
    value: "3+",
    label: "Years of experience",
  },
];

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);

  useEffect(() => {
    const loadFeaturedVideo = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          slug,
          thumbnail_url,
          categories (
            name,
            slug
          )
        `)
        .eq("featured", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setFeaturedVideo(data as unknown as FeaturedVideo);
      }
    };

    void loadFeaturedVideo();
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-20 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className={`text-sm font-medium uppercase tracking-[0.25em] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
                About Me
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Creative editing that brings{" "}
                <span className="text-zinc-400">
                  ideas to life.
                </span>
              </h1>

              <p className={`mt-6 max-w-2xl leading-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                I am a passionate video editor focused on
                transforming raw footage into clear,
                engaging, and memorable visual stories. I
                work with creators, brands, businesses, and
                individuals to produce videos that look
                professional and communicate effectively.
              </p>

              <p className={`mt-5 max-w-2xl leading-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Every project is approached with attention
                to pacing, storytelling, visual consistency,
                sound, and audience experience. My goal is
                not only to edit footage but to create
                content that supports the purpose behind the
                project.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-lg"
                >
                  Work With Me
                </Link>

                <Link
                  to="/#portfolio"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-lg"
                >
                  View Portfolio
                </Link>
              </div>
            </motion.div>

            {/* ✅ REPLACED: Static Image with Dynamic Featured Project Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65 }}
              className="relative"
            >
              <div className={`absolute -inset-5 rounded-3xl blur-2xl ${isDark ? "bg-purple-500/20" : "bg-purple-500/10"}`} />

              <div className={`relative overflow-hidden rounded-3xl border shadow-2xl ${isDark ? "border-white/10 bg-zinc-950" : "border-black/10 bg-white"}`}>
                {featuredVideo?.thumbnail_url ? (
                  <img
                    src={featuredVideo.thumbnail_url}
                    alt={featuredVideo.title}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className={`flex aspect-[4/5] items-center justify-center ${isDark ? "bg-gradient-to-br from-zinc-900 to-zinc-800" : "bg-gradient-to-br from-zinc-100 to-zinc-200"}`}>
                    <Film size={80} className={isDark ? "text-zinc-600" : "text-zinc-400"} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-xl ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                    <Play size={22} fill="currentColor" />
                  </div>

                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-300 drop-shadow-md">
                    Featured Project
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white drop-shadow-md">
                    {featuredVideo?.title ?? "Your next creative project"}
                  </h2>

                  {featuredVideo?.categories && (
                    <p className="mt-2 text-sm font-medium text-purple-300 drop-shadow-md">
                      {featuredVideo.categories.name}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-3">
            {statistics.map((statistic, index) => {
              const Icon = statistic.icon;

              return (
                <motion.div
                  key={statistic.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-zinc-950" : "border-black/10 bg-zinc-100"}`}
                >
                  <Icon size={24} className="text-zinc-400" />

                  <p className="mt-5 text-3xl font-bold">{statistic.value}</p>

                  <p className={`mt-2 text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
                    {statistic.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className={`text-sm font-medium uppercase tracking-[0.25em] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
                My Skills
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Editing skills built for modern content
              </h2>

              <p className={`mt-5 max-w-xl leading-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                From short social media clips to complete
                promotional projects, I use creative and
                technical editing skills to produce
                professional content.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-zinc-950" : "border-black/10 bg-zinc-100"}`}
                  >
                    <CheckCircle2
                      size={18}
                      className={isDark ? "shrink-0 text-zinc-300" : "shrink-0 text-zinc-700"}
                    />

                    <span className={isDark ? "text-sm text-zinc-300" : "text-sm text-zinc-700"}>
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "border-white/10 bg-zinc-950" : "border-black/10 bg-zinc-100"}`}
            >
              <p className={`text-sm font-medium uppercase tracking-[0.25em] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
                My Process
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                A clear process from footage to final delivery
              </h2>

              <div className="mt-8 space-y-7">
                {[
                  {
                    number: "01",
                    title: "Project discussion",
                    description:
                      "We discuss the purpose, editing style, audience, deadline, and final delivery requirements.",
                  },
                  {
                    number: "02",
                    title: "Editing and storytelling",
                    description:
                      "I organize the footage, build the story, improve pacing, and add suitable visual and audio elements.",
                  },
                  {
                    number: "03",
                    title: "Review and revisions",
                    description:
                      "You review the draft and share feedback so the video can be refined accurately.",
                  },
                  {
                    number: "04",
                    title: "Final delivery",
                    description:
                      "The completed video is exported in the required format and prepared for its target platform.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"}`}>
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-semibold">{step.title}</h3>

                      <p className={`mt-2 text-sm leading-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className={`text-sm font-medium uppercase tracking-[0.25em] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
              Services
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              How I can help with your content
            </h2>

            <p className={`mx-auto mt-4 max-w-2xl leading-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Flexible editing services for creators,
              businesses, advertisements, social media, and
              personal video projects.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className={`rounded-2xl border p-6 transition hover:-translate-y-1 ${isDark ? "border-white/10 bg-zinc-950 hover:border-white/20" : "border-black/10 bg-zinc-100 hover:border-black/20"}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"}`}>
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">{service.title}</h3>

                  <p className={`mt-3 leading-7 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {service.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-3xl border px-6 py-14 text-center sm:px-10 ${isDark ? "border-white/10 bg-zinc-950" : "border-black/10 bg-zinc-100"}`}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to start your next video project?
            </h2>

            <p className={`mx-auto mt-4 max-w-2xl leading-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Share your project idea, footage details, and
              preferred editing style to begin the
              collaboration.
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-lg"
                >
              Contact Me
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}