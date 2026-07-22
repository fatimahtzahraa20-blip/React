import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioLines,
  Captions,
  Check,
  Clapperboard,
  Film,
  Layers3,
  MonitorPlay,
  Palette,
  Play,
  Scissors,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Scissors,
    title: "Professional Video Editing",
    description:
      "Complete editing of raw footage into a clear, engaging, and professionally structured final video.",
    features: [
      "Footage organization",
      "Clean cuts and pacing",
      "Transitions and effects",
      "Final platform-ready export",
    ],
  },
  {
    icon: MonitorPlay,
    title: "YouTube Video Editing",
    description:
      "Audience-focused editing for YouTube creators, educational channels, interviews, and entertainment content.",
    features: [
      "Long-form video editing",
      "B-roll placement",
      "Animated titles",
      "Viewer-retention pacing",
    ],
  },
  {
    icon: Clapperboard,
    title: "Short-Form Content",
    description:
      "Fast, engaging vertical videos prepared for Instagram Reels, TikTok, YouTube Shorts, and advertisements.",
    features: [
      "Vertical video formatting",
      "Engaging hook creation",
      "Dynamic captions",
      "Trending-style transitions",
    ],
  },
  {
    icon: Sparkles,
    title: "Motion Graphics",
    description:
      "Animated visual elements that improve communication, branding, and the overall quality of your video.",
    features: [
      "Animated text",
      "Logo animation",
      "Lower thirds",
      "Custom transitions",
    ],
  },
  {
    icon: Palette,
    title: "Color Correction and Grading",
    description:
      "Professional color improvement to create visual consistency and establish the right mood for every scene.",
    features: [
      "Exposure correction",
      "White-balance adjustment",
      "Creative color grading",
      "Shot-to-shot consistency",
    ],
  },
  {
    icon: AudioLines,
    title: "Audio Editing",
    description:
      "Clean and balanced audio that helps dialogue, music, and sound effects work together effectively.",
    features: [
      "Noise reduction",
      "Voice enhancement",
      "Music balancing",
      "Sound-effect placement",
    ],
  },
  {
    icon: Captions,
    title: "Captions and Subtitles",
    description:
      "Readable and accurately timed captions that make your content easier to understand and more accessible.",
    features: [
      "Manual subtitle timing",
      "Animated captions",
      "Brand-matched typography",
      "Vertical-video captions",
    ],
  },
  {
    icon: Layers3,
    title: "Brand and Commercial Videos",
    description:
      "Professional promotional content created for products, businesses, services, campaigns, and digital brands.",
    features: [
      "Promotional storytelling",
      "Product highlights",
      "Brand consistency",
      "Call-to-action editing",
    ],
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share your project",
    description:
      "Send your footage, project instructions, examples, preferred style, and required delivery date.",
  },
  {
    number: "02",
    title: "Editing begins",
    description:
      "The footage is organized and edited according to the purpose, audience, and style of your project.",
  },
  {
    number: "03",
    title: "Review the draft",
    description:
      "You receive a draft and provide feedback about any changes or improvements you would like.",
  },
  {
    number: "04",
    title: "Receive the final video",
    description:
      "The completed project is exported in the required resolution, format, and aspect ratio.",
  },
];

const projectTypes = [
  "YouTube videos",
  "Instagram Reels",
  "YouTube Shorts",
  "TikTok videos",
  "Product advertisements",
  "Business promotions",
  "Educational videos",
  "Interviews and podcasts",
  "Travel videos",
  "Cinematic montages",
  "Event highlights",
  "Personal projects",
];

export default function Services() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <Film size={16} />
              Video Editing Services
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
              Professional editing for{" "}
              <span className="text-zinc-400">
                modern digital content.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
              From simple clean edits to complete promotional
              videos, every service is focused on storytelling,
              visual quality, audience engagement, and reliable
              delivery.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
              >
                Start a Project
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/#portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
              >
                <Play size={18} />
                View Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              What I Offer
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Editing services for different content needs
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Choose the service that best matches your project.
              Multiple services can also be combined into one
              complete editing package.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.title}
                  initial={{
                    opacity: 0,
                    y: 22,
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
                    delay: index * 0.05,
                  }}
                  className="group rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black transition group-hover:bg-white group-hover:text-black">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    {service.title}
                  </h3>

                  <p className="mt-3 min-h-20 leading-7 text-zinc-400">
                    {service.description}
                  </p>

                  <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-zinc-300"
                      >
                        <Check
                          size={16}
                          className="shrink-0 text-zinc-500"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
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
              className="rounded-3xl border border-white/10 bg-zinc-950 p-7 sm:p-9"
            >
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                Project Types
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Content I can edit
              </h2>

              <p className="mt-4 leading-8 text-zinc-400">
                Editing can be adapted according to your content,
                platform, audience, visual style, and project
                requirements.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {projectTypes.map((projectType) => (
                  <div
                    key={projectType}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-3"
                  >
                    <Check
                      size={16}
                      className="shrink-0 text-zinc-400"
                    />

                    <span className="text-sm text-zinc-300">
                      {projectType}
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
            >
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                Workflow
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                A simple and organized editing process
              </h2>

              <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
                Clear communication at every stage helps keep the
                project accurate, efficient, and aligned with your
                expectations.
              </p>

              <div className="mt-8 space-y-4">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{
                      opacity: 0,
                      y: 15,
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
                      delay: index * 0.08,
                    }}
                    className="flex gap-5 rounded-2xl border border-white/10 bg-zinc-950 p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black text-sm font-semibold">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
            }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 px-6 py-14 text-center sm:px-10"
          >
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Custom Project
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
              Need a service that is not listed here?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-zinc-400">
              Share your footage, goals, preferred editing style,
              and delivery requirements. A custom workflow can be
              created for your project.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Discuss Your Project
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}