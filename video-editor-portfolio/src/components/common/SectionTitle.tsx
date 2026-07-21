import { motion } from "framer-motion";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionTitleProps) {
  const isCenter = align === "center";

  return (
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
        amount: 0.3,
      }}
      transition={{
        duration: 0.5,
      }}
      className={`${isCenter ? "text-center mx-auto" : ""} ${className}`}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p
          className={`mt-5 text-base leading-8 text-zinc-400 ${
            isCenter ? "mx-auto max-w-3xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}