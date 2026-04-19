import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/page-layout";
import { CourseDirectory } from "@/components/course-directory";
import type { CourseData } from "@/components/course-directory";

export const metadata: Metadata = {
  title: "Dal Courses — flashcardbrowser",
  description:
    "Browse the Dalhousie course directory. Find community-maintained flashcard decks for your Dal courses.",
};

export default async function CoursesPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  const collectionsRaw = await prisma.collection.findMany({
    where: { courseCode: { not: null } },
    include: {
      _count: { select: { decks: true } },
      ...(session
        ? { pinnedBy: { where: { userId: session.user.id }, select: { userId: true } } }
        : {}),
    },
    orderBy: { courseCode: "asc" },
  });

  const courses: CourseData[] = collectionsRaw.map((c) => ({
    id: c.id,
    name: c.name,
    courseCode: c.courseCode!,
    deckCount: c._count.decks,
    isPinned: session ? (c.pinnedBy ?? []).length > 0 : false,
  }));

  return (
    <PageLayout
      title="Dal Courses"
      subtitle="Community-maintained decks for Dalhousie courses"
      maxWidth="max-w-4xl"
    >
      <CourseDirectory courses={courses} isAuthenticated={!!session} />
    </PageLayout>
  );
}
