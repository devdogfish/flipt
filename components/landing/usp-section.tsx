"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useState, useEffect } from "react";
import { Copy, Pencil, Sparkles, FileText, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ──────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    code: "PSYC 1011",
    name: "Introduction to Psychology",
    cards: 312,
    grade: "A+",
  },
  { code: "BIOL 1010", name: "Principles of Biology", cards: 248, grade: "A+" },
  { code: "CHEM 1011", name: "General Chemistry I", cards: 195, grade: "A" },
  {
    code: "STAT 1060",
    name: "Introduction to Statistics",
    cards: 167,
    grade: "A+",
  },
  {
    code: "CSCI 1100",
    name: "Intro to Computer Science",
    cards: 221,
    grade: "A",
  },
];

const AI_CARDS = [
  "What are the two types of conditioning in behaviourism?",
  "Define long-term potentiation (LTP).",
  "Explain the difference between recall and recognition.",
];

// ─── Shared animation variants ────────────────────────────────────────────────

const textContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const textItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 20, stiffness: 240 },
  },
};

// ─── Visual 1: Course Library ─────────────────────────────────────────────────

function CourseLibraryVisual() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % COURSES.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", damping: 24, stiffness: 180 }}
      className="w-full max-w-sm mx-auto rounded-xl border border-border bg-card shadow-[0_4px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-muted/40">
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="flex-1 mx-3 h-5 rounded bg-background border border-border flex items-center justify-center">
          <span className="text-[9px] text-muted-foreground font-mono">
            flashcardbrowser.com/decks
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 h-8">
          <span className="text-[11px] text-muted-foreground/50 select-none">
            ⌕
          </span>
          <span className="text-[11px] text-muted-foreground">
            Search Dal courses
          </span>
          <motion.span
            className="inline-block w-px h-3 bg-muted-foreground/40 align-middle"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </div>
      </div>

      {/* Course rows */}
      <div className="px-4 pb-4 space-y-1.5">
        {COURSES.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 240,
              delay: 0.05 + i * 0.06,
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 border transition-all duration-500",
              active === i
                ? "border-gold/50 bg-gold/5 shadow-[inset_0_0_0_1px_rgba(255,212,0,0.08)]"
                : "border-border bg-background",
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono text-muted-foreground leading-none mb-0.5">
                {c.code}
              </p>
              <p className="text-[11px] font-medium text-foreground truncate">
                {c.name}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono text-muted-foreground/50">
                {c.cards}c
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-mono">
                {c.grade}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Flow connector ───────────────────────────────────────────────────────────

function FlowConnector() {
  return (
    <div className="flex flex-col items-center py-4 gap-0">
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-px h-10 bg-linear-to-b from-border via-gold/30 to-gold/50 origin-top"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", damping: 18, stiffness: 260, delay: 0.3 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/60 text-[11px] font-medium text-foreground dark:border-gold/40 dark:bg-gold/5 dark:text-gold"
      >
        <GitFork className="w-3 h-3" />
        Copy this deck
      </motion.div>
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="w-px h-10 bg-linear-to-b from-gold/50 via-gold/30 to-border origin-top"
      />
    </div>
  );
}

// ─── Visual 2: Customize ─────────────────────────────────────────────────────

type Tab = "edit" | "ai";
type AiStep = "idle" | "generating" | "done";

function CustomizeVisual() {
  const [tab, setTab] = useState<Tab>("edit");
  const [aiStep, setAiStep] = useState<AiStep>("idle");
  const [cardCount, setCardCount] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (tab === "edit") {
      t = setTimeout(() => {
        setTab("ai");
        setAiStep("idle");
        setCardCount(0);
      }, 4200);
    } else if (aiStep === "idle") {
      t = setTimeout(() => setAiStep("generating"), 1100);
    } else if (aiStep === "generating") {
      if (cardCount < AI_CARDS.length) {
        t = setTimeout(() => setCardCount((n) => n + 1), 780);
      } else {
        t = setTimeout(() => setAiStep("done"), 500);
      }
    } else if (aiStep === "done") {
      t = setTimeout(() => {
        setTab("edit");
        setAiStep("idle");
        setCardCount(0);
      }, 3000);
    }

    return () => clearTimeout(t);
  }, [tab, aiStep, cardCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", damping: 24, stiffness: 180 }}
      className="w-full max-w-sm mx-auto rounded-xl border border-border bg-card shadow-[0_4px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      {/* Tab bar */}
      <div className="flex border-b border-border bg-muted/30">
        {(["edit", "ai"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setAiStep("idle");
              setCardCount(0);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-medium relative transition-colors",
              tab === t ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {t === "edit" ? (
              <Pencil className="w-3 h-3" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {t === "edit" ? "Edit manually" : "AI from docs"}
            {tab === t && (
              <motion.div
                layoutId="usp-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 min-h-[210px]">
        <AnimatePresence mode="wait">
          {tab === "edit" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              className="space-y-3"
            >
              <div>
                <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5">
                  Front
                </p>
                <div className="rounded-lg border border-border bg-background p-2.5 text-[11px] text-foreground leading-relaxed">
                  Define the difference between long-term and short-term memory.
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5">
                  Back
                </p>
                <div className="rounded-lg border border-gold/50 bg-background p-2.5 text-[11px] text-foreground leading-relaxed">
                  Short-term holds ~7 items for seconds; long-term stores
                  indefinitely through consolidation.
                  <motion.span
                    className="inline-block w-px h-3 bg-gold align-middle ml-0.5"
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      times: [0, 0.5, 0.5, 1],
                    }}
                  />
                </div>
              </div>
              <button className="w-full py-2 rounded-lg border border-dashed border-gold/40 text-[11px] font-medium text-gold hover:bg-gold/5 transition-colors">
                + Add card
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
            >
              <AnimatePresence mode="wait">
                {aiStep === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-3 py-7 border-2 border-dashed border-border rounded-xl"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FileText className="w-7 h-7 text-muted-foreground/40" />
                    </motion.div>
                    <p className="text-[11px] text-muted-foreground">
                      Drop your lecture notes or PDF
                    </p>
                    <div className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-[10px] text-gold font-medium font-mono">
                      PSYC 1011 — Lecture 7.pdf
                    </div>
                  </motion.div>
                )}

                {(aiStep === "generating" || aiStep === "done") && (
                  <motion.div
                    key="gen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        animate={
                          aiStep === "generating"
                            ? { rotate: 360 }
                            : { rotate: 0 }
                        }
                        transition={{
                          duration: 1.2,
                          repeat: aiStep === "generating" ? Infinity : 0,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                      </motion.div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {aiStep === "done"
                          ? `${AI_CARDS.length} cards ready`
                          : "Generating flashcards…"}
                      </span>
                    </div>
                    {AI_CARDS.slice(0, cardCount).map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 280,
                        }}
                        className="overflow-hidden rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <p className="text-[9px] font-mono text-gold mb-0.5">
                          Q
                        </p>
                        <p className="text-[10px] text-foreground leading-relaxed">
                          {q}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── USP block ─────────────────────────────────────────────────────────────────

interface UspBlockProps {
  number: string;
  label: string;
  headline: string;
  headlineAccent: string;
  body: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  reverse?: boolean;
}

function UspBlock({
  number,
  label,
  headline,
  headlineAccent,
  body,
  icon,
  visual,
  reverse,
}: UspBlockProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-12 lg:gap-20",
        reverse ? "lg:flex-row-reverse" : "lg:flex-row",
      )}
    >
      <motion.div
        variants={textContainer}
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="flex-1 max-w-md"
      >
        <motion.div
          variants={textItem}
          className="flex items-center gap-3 mb-5"
        >
          <span className="text-[11px] font-mono text-muted-foreground select-none">
            {number}
          </span>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            {icon}
            {label}
          </div>
        </motion.div>

        <motion.h3
          variants={textItem}
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] mb-4"
        >
          {headline}{" "}
          <span className="font-serif italic text-gold">{headlineAccent}</span>
        </motion.h3>

        <motion.p
          variants={textItem}
          className="text-muted-foreground leading-relaxed"
        >
          {body}
        </motion.p>
      </motion.div>

      <div className="flex-1 w-full max-w-sm lg:max-w-none">{visual}</div>
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export function UspSection() {
  return (
    <section className="px-5 py-24 max-w-5xl mx-auto">
      <UspBlock
        number="01"
        label="Course library"
        headline="Your exact deck"
        headlineAccent="already exists."
        body="Dal students build and share complete course decks every semester — made by classmates who aced it. PSYC 1011, BIOL 1010, CHEM 1011, STAT 1060 — find your course, one click, and start studying. No setup."
        icon={<Copy className="w-3.5 h-3.5" />}
        visual={<CourseLibraryVisual />}
      />

      <FlowConnector />

      <UspBlock
        number="02"
        label="Make it yours"
        headline="Copy it. Edit manually"
        headlineAccent="or let AI do it."
        body="Every deck is a starting point. Trim what won't be tested, add your prof's examples — or drop in your lecture PDF and get cards in seconds. Either way, the deck becomes yours."
        icon={<Pencil className="w-3.5 h-3.5" />}
        visual={<CustomizeVisual />}
        reverse
      />
    </section>
  );
}
