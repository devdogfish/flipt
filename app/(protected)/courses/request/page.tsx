"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCourseRequest } from "@/app/actions";

export default function CourseRequestPage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = courseCode.trim();
    const name = courseName.trim();
    if (!code || !name) return;
    setError(null);
    setSubmitting(true);
    try {
      await createCourseRequest(code, name, notes.trim() || undefined);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh px-5 py-16 mx-auto max-w-lg">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft size={14} />
        Back to Courses
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight mb-1">Request a Course</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Don&rsquo;t see your Dal course in the directory? Submit a request and we&rsquo;ll add it.
      </p>

      {submitted ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center space-y-3">
          <p className="font-semibold text-sm">Request submitted</p>
          <p className="text-xs text-muted-foreground">
            We&rsquo;ll review your request and add the course to the directory soon.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Link href="/courses">
              <Button size="sm" variant="outline">Back to Courses</Button>
            </Link>
            <Button size="sm" onClick={() => { setSubmitted(false); setCourseCode(""); setCourseName(""); setNotes(""); }}>
              Submit another
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="courseCode">
              Course code
            </label>
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => { setCourseCode(e.target.value.toUpperCase()); setError(null); }}
              placeholder="e.g. PSYC 2060"
              className="font-mono uppercase placeholder:normal-case placeholder:font-sans"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="courseName">
              Course name
            </label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => { setCourseName(e.target.value); setError(null); }}
              placeholder="e.g. Social Psychology"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know…"
              disabled={submitting}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || !courseCode.trim() || !courseName.trim()}
            className="w-full"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </form>
      )}
    </main>
  );
}
