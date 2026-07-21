import { motion } from "framer-motion";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({
  text = "Loading...",
  fullScreen = false,
}: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
        className="h-12 w-12 rounded-full border-4 border-zinc-700 border-t-white"
      />

      <p className="text-sm text-zinc-400">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10">
      {content}
    </div>
  );
}