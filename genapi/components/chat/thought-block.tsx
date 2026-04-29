"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ThoughtBlockProps {
  content: string;
  thinkingDuration?: number;
  isStreaming?: boolean;
}

/* ── Animated sparkle icon ── */
function AnimatedSparkle({ animate }: { animate: boolean }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      animate={animate ? { rotate: [0, 360] } : {}}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
    >
      {/* Outer sparkle arms */}
      <motion.path
        d="M12 2L13.5 8.5L20 7L14.5 11L18 17L12 13.5L6 17L9.5 11L4 7L10.5 8.5L12 2Z"
        fill="currentColor"
        className={animate ? "text-amber-500" : "text-slate-400"}
        animate={animate ? { opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] } : {}}
        transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      />
      {/* Inner glow dot */}
      {animate && (
        <motion.circle
          cx="12"
          cy="10"
          r="2"
          fill="currentColor"
          className="text-amber-300"
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.svg>
  );
}

/* ── Animated "Thinking" text with wave effect ── */
function ThinkingWaveText() {
  const letters = "Thinking".split("");
  return (
    <span className="inline-flex items-center">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block text-slate-500 font-medium"
          animate={{
            y: [0, -3, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
        >
          {letter}
        </motion.span>
      ))}
      {/* Bouncing dots */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={`dot-${i}`}
          className="inline-block w-[3px] h-[3px] rounded-full bg-slate-400 mx-[1px] ml-[2px]"
          animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12 + 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

/* ── Elapsed timer with subtle pulse ── */
function ElapsedBadge({ seconds }: { seconds: number }) {
  return (
    <motion.span
      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 tabular-nums"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {seconds}s
    </motion.span>
  );
}

export function ThoughtBlock({
  content,
  thinkingDuration,
  isStreaming = false,
}: ThoughtBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isStreaming) {
      if (elapsedSeconds > 0) setFinalDuration(elapsedSeconds);
      return;
    }
    startTimeRef.current = Date.now();
    setFinalDuration(null);
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const displaySeconds =
    thinkingDuration ?? finalDuration ?? (isStreaming ? elapsedSeconds : estimateDuration(content));

  return (
    <div className="my-5">
      {/* Header row */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className={cn(
          "group/tb flex items-center gap-2 py-1.5",
          "text-[13px] cursor-pointer select-none",
          "transition-colors duration-200",
          "hover:text-slate-700"
        )}
      >
        <AnimatedSparkle animate={isStreaming} />

        {isStreaming ? (
          <span className="flex items-center gap-2">
            <ThinkingWaveText />
            <ElapsedBadge seconds={elapsedSeconds} />
          </span>
        ) : (
          <span className="text-slate-500 font-medium">
            Thought for{" "}
            <span className="tabular-nums">{displaySeconds}</span>{" "}
            second{displaySeconds !== 1 ? "s" : ""}
          </span>
        )}

        {/* Chevron — rotates 90° on expand */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="ml-0.5"
        >
          <ChevronRight className="size-3.5 text-slate-400 group-hover/tb:text-slate-500 transition-colors" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 250, damping: 25 },
              opacity: { duration: 0.25, delay: 0.05 },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pt-2 pb-3"
            >
              {/* Left accent line */}
              <div className="border-l-[2px] border-slate-200 pl-4 ml-[9px]">
                <div
                  className={cn(
                    "text-[13px] leading-[1.8]",
                    "text-slate-500",
                    "[&_p]:my-1.5 [&_p]:leading-[1.8]",
                    "[&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc",
                    "[&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal",
                    "[&_li]:mt-1 [&_li]:leading-[1.8]",
                    "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono",
                    "[&_strong]:font-semibold [&_strong]:text-slate-600",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-400"
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.min(30, Math.round(words / 15)));
}
