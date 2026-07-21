import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Film,
  Layers,
  MonitorPlay,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-20 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                About Me
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Creative editing that brings{" "}
                <span className="text-zinc-400">
                  ideas to life.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl leading-8 text-zinc-400">
                I am a passionate video editor focused on
                transforming raw footage into clear,
                engaging, and memorable visual stories. I
                work with creators, brands, businesses, and
                individuals to produce videos that look
                professional and communicate effectively.
              </p>

              <p className="mt-5 max-w-2xl leading-8 text-zinc-400">
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
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
                >
                  Work With Me
                </Link>

                <Link
                  to="/#portfolio"
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                  View Portfolio
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.65,
              }}
              className="relative"
            >
              <div className="absolute -inset-5 rounded-3xl bg-white/[0.04] blur-3xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-4">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900">
                  <img
                    src="https://placehold.co/900x1100?text=Video+Editor"
                    alt="Professional video editor"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-black/75 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      <Film size={22} />
                    </div>

                    <div>
                      <p className="text-sm text-zinc-400">
                        Creative profession
                      </p>

                      <p className="font-semibold">
                        Video Editor and Storyteller
                      </p>
                    </div>
                  </div>
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
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                  }}
                  className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
                >
                  <Icon
                    size={24}
                    className="text-zinc-400"
                  />

                  <p className="mt-5 text-3xl font-bold">
                    {statistic.value}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
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
              initial={{
                opacity: 0,
                x: -25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                My Skills
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Editing skills built for modern content
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-zinc-400">
                From short social media clips to complete
                promotional projects, I use creative and
                technical editing skills to produce
                professional content.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-zinc-300"
                    />

                    <span className="text-sm text-zinc-300">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
              }}
              className="rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8"
            >
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
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
                  <div
                    key={step.number}
                    className="flex gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black text-sm font-semibold">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
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
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Services
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              How I can help with your content
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400">
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
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    {service.title}
                  </h3>

                  <p className="mt-3 leading-7 text-zinc-400">
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
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="rounded-3xl border border-white/10 bg-zinc-950 px-6 py-14 text-center sm:px-10"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to start your next video project?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400">
              Share your project idea, footage details, and
              preferred editing style to begin the
              collaboration.
            </p>

            <Link
              to="/contact"
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Contact Me
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}