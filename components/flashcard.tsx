"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addWindDisturbance } from "@/components/overlays/draw-fog2";
import Image from "next/image";

interface FlashcardProps {
  question: string;
  answer: string;
  image?: string;
  category?: string;
  currentIndex: number;
  totalCards: number;
  onResult: (grade: GradeKey) => void;
  onSkip: () => void;
  onPrev: () => void;
  onWhooshPlayed?: (index: number) => void;
}

// ─── Exit group: old card leaving + screen flash overlay ─────────────────────
const EXIT_ANIM = {
  durationMs: 500,
  ease: "easeIn" as const,
};

// ─── Enter group: new card dropping in + camera shake ────────────────────────
const ENTER_ANIM = {
  spring: { stiffness: 500, damping: 28, mass: 0.6 },
  impactMs: 120,
};
// ─────────────────────────────────────────────────────────────────────────────

type GradeKey = "forgot" | "hard" | "good" | "easy";

const GRADE_CONFIG: {
  grade: GradeKey;
  label: string;
  hoverClass: string;
  isCorrect: boolean;
}[] = [
  {
    grade: "forgot",
    label: "Forgot",
    hoverClass:
      "hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5",
    isCorrect: false,
  },
  {
    grade: "good",
    label: "Got it",
    hoverClass:
      "hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5",
    isCorrect: true,
  },
];

export function Flashcard({
  question,
  answer,
  image,
  category,
  currentIndex,
  totalCards,
  onResult,
  onSkip,
  onPrev,
  onWhooshPlayed,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [isEntering, setIsEntering] = useState(true);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const resultBufferRef = useRef<AudioBuffer | null>(null);
  const whooshBuffersRef = useRef<AudioBuffer[]>([]);
  const prevIndexRef = useRef(currentIndex);
  let enterFromBelow = false;
  if (currentIndex !== prevIndexRef.current) {
    enterFromBelow = currentIndex < prevIndexRef.current;
    prevIndexRef.current = currentIndex;
  }

  const CORRECT_SOUND = { offset: 1.805, duration: 1.14 };
  const INCORRECT_SOUND = { offset: 2.949, duration: 1.25 };

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    fetch("/sounds/correct-incorrect-ring-sound.mp3")
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        resultBufferRef.current = decoded;
      })
      .catch(() => {});
    Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        fetch(`/sounds/whoosh/${n}.mp3`)
          .then((r) => r.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf)),
      ),
    )
      .then((buffers) => {
        whooshBuffersRef.current = buffers;
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setTilt({ x: y * -12, y: x * 12 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const triggerShake = useCallback(() => {
    setShakeOffset({ x: -2, y: 7 });
    setTimeout(() => setShakeOffset({ x: 2, y: -4 }), 65);
    setTimeout(() => setShakeOffset({ x: -1, y: 2 }), 130);
    setTimeout(() => setShakeOffset({ x: 1, y: -1 }), 195);
    setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 260);
  }, []);

  useEffect(() => {
    initAudio();
    setIsFlipped(false);
    setExitDirection(null);
    setIsEntering(true);

    const WHOOSH_OFFSETS = [0.267, 0.203, 0.476, 0.075, 0.38];
    const buffers = whooshBuffersRef.current;
    if (audioCtxRef.current && buffers.length > 0) {
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const idx = 4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.connect(ctx.destination);
      const src = ctx.createBufferSource();
      src.buffer = buffers[idx];
      src.playbackRate.value = 1.5;
      src.connect(gain);
      src.start(0, WHOOSH_OFFSETS[idx]);
      onWhooshPlayed?.(idx + 1);
    }

    addWindDisturbance(window.innerWidth / 2, window.innerHeight / 2);

    const shakeTimer = -1 as unknown as ReturnType<typeof setTimeout>;
    return () => clearTimeout(shakeTimer);
  }, [currentIndex, triggerShake, initAudio]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleResult = useCallback(
    (grade: GradeKey) => {
      initAudio();
      const isCorrect = grade === "good" || grade === "easy";
      if (audioCtxRef.current && resultBufferRef.current) {
        const ctx = audioCtxRef.current;
        const { offset, duration } = isCorrect ? CORRECT_SOUND : INCORRECT_SOUND;
        const src = ctx.createBufferSource();
        src.buffer = resultBufferRef.current;
        src.connect(ctx.destination);
        src.start(0, offset, duration);
      }
      setFlashColor(isCorrect ? "green" : "red");
      setFlashKey((prev) => prev + 1);
      setExitDirection(isCorrect ? "right" : "left");

      setTimeout(() => {
        setExitDirection(null);
        onResult(grade);
      }, EXIT_ANIM.durationMs);
    },
    [onResult, initAudio],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+Cmd/Ctrl+Enter = Forgot without flipping
      if (e.code === "Enter" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleResult("forgot");
        return;
      }
      // Cmd/Ctrl+Enter = Good without flipping
      if (e.code === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleResult("good");
        return;
      }
      // Space or Enter = flip
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        initAudio();
        handleFlip();
        return;
      }
      // Navigation — always available
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        onSkip();
        return;
      }
      // Judgment — only after reveal
      if (isFlipped) {
        if (e.code === "Digit1" || e.code === "ArrowDown" || e.code === "KeyJ") {
          e.preventDefault();
          handleResult("forgot");
          return;
        }
        if (e.code === "Digit2" || e.code === "ArrowUp" || e.code === "KeyK") {
          e.preventDefault();
          handleResult("good");
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, handleFlip, handleResult, initAudio, onSkip, onPrev]);

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full px-5 overflow-hidden"
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        transition:
          shakeOffset.x === 0 && shakeOffset.y === 0
            ? "transform 0.18s ease-out"
            : "transform 0.065s ease-out",
      }}
    >
      {/* Screen flash overlay */}
      <AnimatePresence>
        {flashColor && (
          <motion.div
            key={flashKey}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background:
                flashColor === "green"
                  ? "radial-gradient(circle at center, transparent 30%, rgba(34, 197, 94, 0.6) 100%)"
                  : "radial-gradient(circle at center, transparent 30%, rgba(239, 68, 68, 0.6) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, times: [0, 0.25, 1], ease: "easeOut" }}
            onAnimationComplete={() => setFlashColor(null)}
          />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        key={currentIndex}
        ref={cardRef}
        className="relative w-full max-w-md aspect-3/4 max-h-[65vh] cursor-pointer"
        onClick={handleFlip}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1200px" }}
        initial={{ opacity: 0, scale: 1.5, y: enterFromBelow ? 100 : -100 }}
        animate={
          exitDirection === "right"
            ? { x: "120%", rotate: 12, opacity: 0, scale: 1, y: 0 }
            : exitDirection === "left"
              ? { x: "-120%", rotate: -12, opacity: 0, scale: 1, y: 0 }
              : { opacity: 1, scale: 1, y: 0, x: 0 }
        }
        transition={
          exitDirection
            ? { duration: EXIT_ANIM.durationMs / 1000, ease: EXIT_ANIM.ease }
            : { type: "spring", ...ENTER_ANIM.spring }
        }
        onAnimationComplete={() => {
          if (!exitDirection) setIsEntering(false);
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transition: isEntering ? "none" : "transform 0.3s ease-out",
            transform: isEntering
              ? "none"
              : `rotateX(${tilt.x}deg) rotateY(${(isFlipped ? 180 : 0) + tilt.y}deg)`,
          }}
        >
          {/* Front - Question */}
          <div
            className={cn(
              "absolute inset-0 rounded-3xl bg-card dark:bg-zinc-900 overflow-hidden",
              "flex flex-col",
              "shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)]",
              "dark:shadow-none dark:border dark:border-white/20",
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            {category && (
              <div className="absolute top-5 left-6 z-10">
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    image
                      ? "bg-black/40 text-white backdrop-blur-sm"
                      : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
                  )}
                >
                  {category}
                </span>
              </div>
            )}

            {image && (
              <div className="relative h-2/5 bg-neutral-100">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                />
              </div>
            )}

            <div
              className={cn(
                "flex-1 flex items-center justify-center p-8",
                !image && "p-10 pt-14",
              )}
            >
              <p className="text-xl sm:text-2xl font-medium text-center leading-relaxed text-balance tracking-tight">
                {question}
              </p>
            </div>
          </div>

          {/* Back - Answer */}
          <div
            className={cn(
              "absolute inset-0 rounded-3xl bg-card dark:bg-zinc-900 overflow-hidden",
              "flex flex-col",
              "shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)]",
              "dark:shadow-none dark:border dark:border-white/20",
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-lg sm:text-xl text-center leading-relaxed text-foreground/80 text-balance">
                {answer}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grade buttons */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 mt-8 w-full max-w-md transition-all duration-300",
          isFlipped && !exitDirection
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none",
        )}
      >
        {GRADE_CONFIG.map((cfg) => (
          <button
            key={cfg.grade}
            onClick={(e) => {
              e.stopPropagation();
              handleResult(cfg.grade);
            }}
            className={cn(
              "flex-1 rounded-xl border border-border bg-secondary",
              "py-2.5 px-1 text-sm font-medium text-secondary-foreground",
              "transition-colors",
              cfg.hoverClass,
            )}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <p
        className={cn(
          "mt-6 text-[13px] text-muted-foreground tabular-nums transition-opacity duration-300",
          isFlipped ? "opacity-0" : "opacity-100",
        )}
      >
        {currentIndex + 1} of {totalCards}
      </p>
    </div>
  );
}
