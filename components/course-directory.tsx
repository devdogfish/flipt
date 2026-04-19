"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Search, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { pinCourse, unpinCourse } from "@/app/actions";

export interface CourseData {
  id: string;
  name: string;
  courseCode: string;
  deckCount: number;
  isPinned: boolean;
}

interface CourseDirectoryProps {
  courses: CourseData[];
  isAuthenticated: boolean;
}

// Derive a faculty label from the alphabetic prefix of the course code
function getFaculty(courseCode: string): string {
  const prefix = courseCode.replace(/\s*\d.*$/, "").trim().toUpperCase();
  const map: Record<string, string> = {
    BIOL: "Biology",
    CHEM: "Chemistry",
    PHYS: "Physics",
    MATH: "Mathematics",
    STAT: "Statistics & Data Science",
    CSCI: "Computer Science",
    PSYC: "Psychology",
    COMM: "Commerce",
    MGMT: "Management",
    ENGL: "English",
    HIST: "History",
    POLS: "Political Science",
    SOCI: "Sociology",
    ECON: "Economics",
    NURS: "Nursing",
    PHARM: "Pharmacy",
    MEDI: "Medicine",
    LAWS: "Law",
    ARTS: "Arts & Social Sciences",
    MUSC: "Music",
    THEA: "Theatre",
    FILM: "Film Studies",
    KINE: "Kinesiology",
    ENVS: "Environmental Science",
    GEOL: "Geology",
    DENT: "Dentistry",
  };
  return map[prefix] ?? prefix;
}

export function CourseDirectory({ courses, isAuthenticated }: CourseDirectoryProps) {
  const [query, setQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [localPinned, setLocalPinned] = useState<Set<string>>(
    () => new Set(courses.filter((c) => c.isPinned).map((c) => c.id))
  );
  const [, startTransition] = useTransition();

  const faculties = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const c of courses) {
      const f = getFaculty(c.courseCode);
      if (!seen.has(f)) {
        seen.add(f);
        result.push(f);
      }
    }
    return result.sort();
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesQuery =
        !q ||
        c.courseCode.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q);
      const matchesFaculty =
        facultyFilter === "all" || getFaculty(c.courseCode) === facultyFilter;
      return matchesQuery && matchesFaculty;
    });
  }, [courses, query, facultyFilter]);

  const pinnedCourses = filtered.filter((c) => localPinned.has(c.id));
  const unpinnedCourses = filtered.filter((c) => !localPinned.has(c.id));

  // Group unpinned by faculty
  const byFaculty = useMemo(() => {
    const groups: Record<string, CourseData[]> = {};
    for (const c of unpinnedCourses) {
      const f = getFaculty(c.courseCode);
      if (!groups[f]) groups[f] = [];
      groups[f].push(c);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [unpinnedCourses]);

  function handlePin(courseId: string) {
    setLocalPinned((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
        startTransition(() => unpinCourse(courseId));
      } else {
        next.add(courseId);
        startTransition(() => pinCourse(courseId));
      }
      return next;
    });
  }

  return (
    <>
      {/* Pinned courses */}
      {pinnedCourses.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Pinned
          </p>
          <div className="flex flex-col gap-2">
            {pinnedCourses.map((c) => (
              <CourseRow
                key={c.id}
                course={c}
                isPinned={true}
                isAuthenticated={isAuthenticated}
                onPin={handlePin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search + faculty filter */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by course code or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1">
              {facultyFilter === "all" ? "All Faculties" : facultyFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
            <DropdownMenuItem onClick={() => setFacultyFilter("all")}>
              All Faculties
            </DropdownMenuItem>
            {faculties.map((f) => (
              <DropdownMenuItem key={f} onClick={() => setFacultyFilter(f)}>
                {f}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Directory grouped by faculty */}
      {byFaculty.length === 0 && pinnedCourses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No courses found.</p>
      ) : (
        <div className="space-y-8">
          {byFaculty.map(([faculty, facultyCourses]) => (
            <div key={faculty}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                {faculty}
              </p>
              <div className="flex flex-col gap-2">
                {facultyCourses.map((c) => (
                  <CourseRow
                    key={c.id}
                    course={c}
                    isPinned={localPinned.has(c.id)}
                    isAuthenticated={isAuthenticated}
                    onPin={handlePin}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-14 text-center">
        <p className="text-sm text-muted-foreground">
          Can&rsquo;t find your course?{" "}
          {isAuthenticated ? (
            <Link href="/courses/request" className="text-foreground underline underline-offset-2 hover:no-underline">
              Request it
            </Link>
          ) : (
            <Link href="/auth/sign-up" className="text-foreground underline underline-offset-2 hover:no-underline">
              Sign up to request it
            </Link>
          )}
        </p>
      </div>
    </>
  );
}

function CourseRow({
  course,
  isPinned,
  isAuthenticated,
  onPin,
}: {
  course: CourseData;
  isPinned: boolean;
  isAuthenticated: boolean;
  onPin: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 group">
      {isAuthenticated && (
        <button
          onClick={() => onPin(course.id)}
          title={isPinned ? "Unpin" : "Pin"}
          className={cn(
            "shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors",
            isPinned
              ? "text-amber-500"
              : "text-muted-foreground/30 hover:text-muted-foreground opacity-0 group-hover:opacity-100",
          )}
        >
          <Star className={cn("w-3.5 h-3.5", isPinned && "fill-amber-500")} />
        </button>
      )}
      <Link href={`/decks/course/${course.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60 transition-colors group/row">
          <span className="shrink-0 inline-flex items-center text-[11px] leading-none font-bold px-2.5 py-1 rounded-full bg-foreground text-background">
            {course.courseCode}
          </span>
          <span className="flex-1 min-w-0 text-sm font-medium truncate">{course.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{course.deckCount} decks</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/row:text-foreground transition-colors shrink-0" />
        </div>
      </Link>
    </div>
  );
}
