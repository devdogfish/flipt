"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { schedule, type Grade } from "@/lib/fsrs";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function assertOwner(deckId: string, userId: string) {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { ownerId: true },
  });
  if (!deck || deck.ownerId !== userId)
    throw new Error("Not found or not authorized");
  return deck;
}

// ── Favorites ───────────────────────────────────────────────────────────────

export async function toggleFavorite(deckId: string): Promise<boolean> {
  const { user } = await requireSession();
  const key = { userId: user.id, deckId };
  const existing = await prisma.deckFavorite.findUnique({
    where: { userId_deckId: key },
  });
  if (existing) {
    await prisma.deckFavorite.delete({ where: { userId_deckId: key } });
    return false;
  }
  await prisma.deckFavorite.create({ data: key });
  return true;
}

// ── Flashcard usage ─────────────────────────────────────────────────────────

const gradeMap: Record<string, Grade> = {
  forgot: 1,
  hard: 2,
  good: 3,
  easy: 4,
};
const resultMap: Record<string, "FORGOT" | "HARD" | "GOOD" | "EASY"> = {
  forgot: "FORGOT",
  hard: "HARD",
  good: "GOOD",
  easy: "EASY",
};

export async function recordUsage(
  cardId: string,
  grade: "forgot" | "hard" | "good" | "easy",
): Promise<void> {
  const { user } = await requireSession();

  const existing = await prisma.cardSchedule.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
  });

  const now = new Date();
  const daysSince = existing?.lastReviewedAt
    ? (now.getTime() - existing.lastReviewedAt.getTime()) / 86_400_000
    : 0;

  const result = schedule(
    gradeMap[grade],
    existing?.stability ?? null,
    existing?.difficulty ?? null,
    daysSince,
  );

  const nextDue = new Date(now.getTime() + result.interval * 86_400_000);

  await prisma.cardSchedule.upsert({
    where: { userId_cardId: { userId: user.id, cardId } },
    create: {
      userId: user.id,
      cardId,
      stability: result.stability,
      difficulty: result.difficulty,
      nextDue,
      reviewCount: 1,
      lastReviewedAt: now,
    },
    update: {
      stability: result.stability,
      difficulty: result.difficulty,
      nextDue,
      reviewCount: { increment: 1 },
      lastReviewedAt: now,
    },
  });

  await prisma.flashcardUsage.create({
    data: { userId: user.id, cardId, result: resultMap[grade] },
  });
}

// ── Decks ───────────────────────────────────────────────────────────────────

export async function createDeck(
  title: string,
  description: string,
  visibility: "PRIVATE" | "PUBLIC",
  coverImage?: string | null,
): Promise<void> {
  const { user } = await requireSession();
  if (!title.trim()) throw new Error("Title is required");
  const deck = await prisma.deck.create({
    data: {
      ownerId: user.id,
      title: title.trim(),
      description: description.trim() || null,
      visibility,
      coverImage: coverImage || null,
    },
  });
  revalidatePath("/decks");
  redirect(`/decks/${deck.id}/edit`);
}

export async function updateDeck(
  deckId: string,
  title: string,
  description: string,
  visibility: "PRIVATE" | "PUBLIC",
  coverImage: string | null,
): Promise<void> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);
  await prisma.deck.update({
    where: { id: deckId },
    data: {
      title: title.trim(),
      description: description.trim() || null,
      visibility,
      coverImage: coverImage || null,
    },
  });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}`);
  revalidatePath(`/decks/${deckId}/edit`);
}

async function buildImagePrompt(
  cfAccountId: string,
  cfApiToken: string,
  title: string,
  description?: string,
): Promise<string> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: 1.0,
        messages: [
          {
            role: "system",
            content: [
              "You create short visual descriptions for cover images of academic study decks.",
              "Describe ONE CENTRAL OBJECT or element in sharp focus that instantly communicates the subject. Shallow depth of field, dark background.",
              "Rules:",
              "- Output ONLY 10-20 words. No preamble, no quotes.",
              "- ONE recognizable object fills most of the frame. Not a wide room, not a cityscape, not a panorama.",
              "- The object must be INSTANTLY recognizable as related to the topic — no guessing required.",
              "- NEVER use books, bookshelves, libraries, desks, classrooms, or generic academic imagery.",
              "- For philosophical, spiritual, or contemplative subjects: nature metaphors are perfect (lotus, still water, candle flames, etc.).",
              "- For technical/scientific subjects: show a real relevant object up close (a GPU chip, a microscope lens, a satellite dish, a stethoscope, etc.).",
              "- Examples:",
              "  'Web Search Engines' → 'close-up of a glowing fiber optic cable bundle against pure black'",
              "  'Data Science' → 'a single dark monitor displaying scrolling amber data streams'",
              "  'Machine Learning' → 'extreme close-up of a GPU chip with warm golden light on its circuits'",
              "  'Content Moderation' → 'close-up of a wire mesh screen with golden light filtering through'",
              "  'Criminal Law' → 'a brass gavel head resting on dark polished wood, shallow depth of field'",
              "  'Meditation' → 'a single lotus flower floating on still dark water with soft golden light'",
              "  'Philosophy' → 'a candle flame reflected infinitely in two facing mirrors in darkness'",
              "  'Organic Chemistry' → 'macro shot of a single crystal structure refracting warm amber light'",
              "- Style: dark, atmospheric, warm gold/amber accents, one subject in focus, blurred background.",
              "- NO text, letters, numbers, people, faces, hands, brand logos, clipart, icons, wide shots, or full rooms.",
            ].join(" "),
          },
          {
            role: "user",
            content: description
              ? `Subject: ${title}\nDescription: ${description}`
              : `Subject: ${title}`,
          },
        ],
        max_tokens: 60,
      }),
    },
  );

  const fallback = "ink slowly diffusing through dark water, forming organic cloudy shapes";

  if (!res.ok) {
    console.warn("[buildImagePrompt] Cloudflare LLM error, using fallback");
    return buildFinalPrompt(fallback);
  }

  const json = (await res.json()) as { result: { response: string } };
  const raw = json.result?.response?.trim().replace(/^["']|["']$/g, "") || fallback;
  const visual = raw.split("\n")[0].slice(0, 80);

  return buildFinalPrompt(visual);
}

function buildFinalPrompt(visual: string): string {
  return [
    `Dark moody cinematic photograph: ${visual}.`,
    "Warm gold and amber highlights, deep charcoal shadows, shallow depth of field, cinematic lighting.",
    "Atmospheric, editorial quality. No text, no letters, no numbers, no people, no faces, no icons.",
  ].join(" ");
}

async function pollPixazo(requestId: string, apiKey: string): Promise<string> {
  const pollUrl = `https://gateway.pixazo.ai/v2/requests/status/${requestId}`;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(pollUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      status: string;
      output?: { media_url?: string[] };
    };
    if (data.status === "COMPLETED" && data.output?.media_url?.[0]) {
      return data.output.media_url[0];
    }
    if (data.status === "FAILED" || data.status === "ERROR") {
      throw new Error("Pixazo image generation failed");
    }
  }
  throw new Error("Pixazo image generation timed out");
}

export async function generateCoverImage(
  title: string,
  description?: string,
): Promise<{ url: string }> {
  await requireSession();

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!cfAccountId || !cfApiToken) {
    throw new Error("Image generation is not configured.");
  }

  const prompt = await buildImagePrompt(cfAccountId, cfApiToken, title, description);
  console.log("[generateCoverImage] prompt:", prompt);

  try {
    const pixazoKey = process.env.PIXAZO_API_KEY;
    if (!pixazoKey) throw new Error("No Pixazo key, falling back to Cloudflare");

    const res = await fetch(
      "https://gateway.pixazo.ai/flux-schnell/v1/schnell/textToImage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": pixazoKey,
        },
        body: JSON.stringify({
          prompt,
          image_size: "landscape_4_3",
          num_inference_steps: 4,
          output_format: "jpeg",
          seed: Math.floor(Math.random() * 2147483647),
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("[generateCoverImage] Pixazo error:", res.status, body);
      throw new Error("Pixazo request failed");
    }

    const data = (await res.json()) as { request_id: string };
    const imageUrl = await pollPixazo(data.request_id, pixazoKey);

    // Download and upload to Vercel Blob
    const imgRes = await fetch(imageUrl);
    const bytes = await imgRes.arrayBuffer();
    return await uploadCoverBytes(bytes);
  } catch (pixazoErr) {
    console.warn("[generateCoverImage] Pixazo failed, trying Cloudflare:", pixazoErr);

    // Fallback: Cloudflare
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, steps: 8, seed: Math.floor(Math.random() * 2147483647) }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        console.error("[generateCoverImage] Cloudflare error:", res.status, body);
        throw new Error("Failed to generate image. Please try again or upload manually.");
      }

      const json = (await res.json()) as { result: { image: string } };
      const binStr = atob(json.result.image);
      const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0)).buffer;
      return await uploadCoverBytes(bytes);
    } catch (cfErr) {
      console.error("[generateCoverImage] Both providers failed:", cfErr);
      throw new Error("Failed to generate image. Please try again or upload manually.");
    }
  }
}

async function uploadCoverBytes(bytes: ArrayBuffer): Promise<{ url: string }> {
  const filename = `covers/ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const blob = await put(filename, bytes, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/jpeg",
  });
  return { url: blob.url };
}

export async function regenerateAllCovers(): Promise<{
  total: number;
  success: number;
  failed: string[];
}> {
  const { user } = await requireSession();
  const decks = await prisma.deck.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true, description: true },
  });

  const results = { total: decks.length, success: 0, failed: [] as string[] };

  for (const deck of decks) {
    try {
      const { url } = await generateCoverImage(deck.title, deck.description ?? undefined);
      await prisma.deck.update({
        where: { id: deck.id },
        data: { coverImage: url },
      });
      results.success++;
      console.log(`[regenerateAllCovers] ${deck.title}: OK`);
    } catch (err) {
      results.failed.push(deck.title);
      console.error(`[regenerateAllCovers] ${deck.title}: FAILED`, err);
    }
  }

  revalidatePath("/decks");
  return results;
}

export async function deleteDeck(deckId: string): Promise<void> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);
  await prisma.deck.delete({ where: { id: deckId } });
  revalidatePath("/decks");
  redirect("/decks");
}

// ── Cards ───────────────────────────────────────────────────────────────────

export async function createCard(
  deckId: string,
  question: string,
  answer: string,
  imageUrl?: string | null,
): Promise<void> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);
  const last = await prisma.flashcard.findFirst({
    where: { deckId },
    orderBy: { position: "desc" },
  });
  await prisma.flashcard.create({
    data: {
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      imageUrl: imageUrl || null,
      position: (last?.position ?? -1) + 1,
    },
  });
  revalidatePath(`/decks/${deckId}/edit`);
}

export async function updateCard(
  cardId: string,
  question: string,
  answer: string,
  imageUrl: string | null,
): Promise<void> {
  const { user } = await requireSession();
  const card = await prisma.flashcard.findUnique({
    where: { id: cardId },
    include: { deck: { select: { ownerId: true, id: true } } },
  });
  if (!card || card.deck.ownerId !== user.id) throw new Error("Not found");
  await prisma.flashcard.update({
    where: { id: cardId },
    data: {
      question: question.trim(),
      answer: answer.trim(),
      imageUrl: imageUrl || null,
    },
  });
  revalidatePath(`/decks/${card.deck.id}/edit`);
}

export async function deleteCard(cardId: string): Promise<void> {
  const { user } = await requireSession();
  const card = await prisma.flashcard.findUnique({
    where: { id: cardId },
    include: { deck: { select: { ownerId: true, id: true } } },
  });
  if (!card || card.deck.ownerId !== user.id) throw new Error("Not found");
  await prisma.flashcard.delete({ where: { id: cardId } });
  revalidatePath(`/decks/${card.deck.id}/edit`);
}

export async function forkDeck(deckId: string): Promise<void> {
  const { user } = await requireSession();
  const original = await prisma.deck.findUnique({
    where: { id: deckId, visibility: "PUBLIC" },
    include: { cards: { orderBy: { position: "asc" } } },
  });
  if (!original) throw new Error("Deck not found or not public");
  const newDeck = await prisma.deck.create({
    data: {
      ownerId: user.id,
      title: original.title,
      description: original.description,
      visibility: "PRIVATE",
      coverImage: original.coverImage,
      cards: {
        create: original.cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          imageUrl: c.imageUrl,
          position: c.position,
        })),
      },
    },
  });
  revalidatePath("/decks");
  redirect(`/decks/${newDeck.id}/edit`);
}

// ── API keys ─────────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";

export async function createApiKey(name: string): Promise<{ key: string }> {
  const { user } = await requireSession();
  if (!name.trim()) throw new Error("Name is required");
  const existing = await prisma.apiKey.count({ where: { userId: user.id } });
  if (existing >= 10) throw new Error("Maximum of 10 API keys allowed");
  const key = `flashcardbrowser_${randomBytes(24).toString("hex")}`;
  await prisma.apiKey.create({
    data: { userId: user.id, name: name.trim(), key },
  });
  revalidatePath("/settings");
  return { key };
}

export async function deleteApiKey(keyId: string): Promise<void> {
  const { user } = await requireSession();
  const apiKey = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!apiKey || apiKey.userId !== user.id) throw new Error("Not found");
  await prisma.apiKey.delete({ where: { id: keyId } });
  revalidatePath("/settings");
}

// ── Deck sharing ─────────────────────────────────────────────────────────────

export async function searchUsersForSharing(
  query: string,
): Promise<{ id: string; name: string | null; email: string }[]> {
  await requireSession();
  if (!query.trim()) return [];

  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 10,
  });
}

export async function getDeckShares(
  deckId: string,
): Promise<
  { userId: string; name: string | null; email: string; createdAt: string }[]
> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);

  const shares = await prisma.deckShare.findMany({
    where: { deckId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return shares.map((s) => ({
    userId: s.user.id,
    name: s.user.name,
    email: s.user.email,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function shareDeckWithUser(
  deckId: string,
  userId: string,
): Promise<void> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);

  if (userId === user.id) throw new Error("Cannot share a deck with yourself.");

  await prisma.deckShare.upsert({
    where: { deckId_userId: { deckId, userId } },
    create: { deckId, userId },
    update: {},
  });

  revalidatePath(`/decks/${deckId}`);
}

export async function unshareDeck(
  deckId: string,
  userId: string,
): Promise<void> {
  const { user } = await requireSession();
  await assertOwner(deckId, user.id);

  await prisma.deckShare.deleteMany({
    where: { deckId, userId },
  });

  revalidatePath(`/decks/${deckId}`);
}

// ── Collections ──────────────────────────────────────────────────────────────

export async function createCollection(
  name: string,
): Promise<{ id: string; name: string }> {
  const { user } = await requireSession();
  if (!name.trim()) throw new Error("Name is required");
  const collection = await prisma.collection.create({
    data: { userId: user.id, name: name.trim() },
  });
  revalidatePath("/decks");
  return { id: collection.id, name: collection.name };
}

export async function createCourseCollection(
  courseCode: string,
  name: string,
): Promise<{ id: string; courseCode: string; name: string }> {
  const { user } = await requireSession();

  const code = courseCode.trim().toUpperCase();
  const trimmedName = name.trim();
  if (!code) throw new Error("Course code is required");
  if (!trimmedName) throw new Error("Course name is required");

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.collection.count({
    where: { userId: user.id, courseCode: { not: null }, createdAt: { gte: since } },
  });
  if (recentCount >= 3) {
    throw new Error("Rate limit exceeded — you can create at most 3 course collections per 24 hours");
  }

  const existing = await prisma.collection.findUnique({ where: { courseCode: code } });
  if (existing) {
    throw new Error(`A collection for ${code} already exists`);
  }

  const collection = await prisma.$transaction(async (tx) => {
    const col = await tx.collection.create({
      data: { userId: user.id, name: trimmedName, courseCode: code },
    });
    const deck = await tx.deck.create({
      data: { ownerId: user.id, title: trimmedName, deckType: "COURSE", courseCode: code, visibility: "PUBLIC" },
    });
    await tx.collectionDeck.create({
      data: { collectionId: col.id, deckId: deck.id },
    });
    return col;
  });

  revalidatePath("/decks");
  return { id: collection.id, courseCode: collection.courseCode!, name: collection.name };
}

export async function deleteCollection(id: string): Promise<void> {
  const { user } = await requireSession();
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== user.id)
    throw new Error("Not found");
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/decks");
}

export async function renameCollection(
  id: string,
  name: string,
): Promise<void> {
  const { user } = await requireSession();
  if (!name.trim()) throw new Error("Name is required");
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== user.id)
    throw new Error("Not found");
  await prisma.collection.update({
    where: { id },
    data: { name: name.trim() },
  });
  revalidatePath("/decks");
}

export async function addDeckToCollection(
  collectionId: string,
  deckId: string,
): Promise<void> {
  const { user } = await requireSession();
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });
  if (!collection || collection.userId !== user.id)
    throw new Error("Not found");
  await prisma.collectionDeck.upsert({
    where: { collectionId_deckId: { collectionId, deckId } },
    create: { collectionId, deckId },
    update: {},
  });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}/edit`);
}

export async function removeDeckFromCollection(
  collectionId: string,
  deckId: string,
): Promise<void> {
  const { user } = await requireSession();
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });
  if (!collection || collection.userId !== user.id)
    throw new Error("Not found");
  await prisma.collectionDeck.deleteMany({ where: { collectionId, deckId } });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}/edit`);
}

// ── Dal verification ─────────────────────────────────────────────────────────

export async function sendDalVerification(dalEmail: string): Promise<void> {
  const { user } = await requireSession();

  const normalised = dalEmail.trim().toLowerCase();
  if (!normalised.endsWith("@dal.ca")) {
    throw new Error("Must be a @dal.ca email address.");
  }

  // Check not already claimed by a different account
  const existing = await prisma.user.findUnique({
    where: { dalEmail: normalised },
    select: { id: true },
  });
  if (existing && existing.id !== user.id) {
    throw new Error("That Dal email is already linked to another account.");
  }

  // If this user already has it set, nothing to do
  const self = await prisma.user.findUnique({
    where: { id: user.id },
    select: { dalEmail: true },
  });
  if (self?.dalEmail === normalised) return;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.dalVerification.upsert({
    where: { userId: user.id },
    create: { userId: user.id, dalEmail: normalised, token, expiresAt },
    update: { dalEmail: normalised, token, expiresAt },
  });

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const confirmUrl = `${process.env.BETTER_AUTH_URL}/api/verify-dal/confirm?token=${token}`;

  await resend.emails.send({
    from: "noreply@flashcardbrowser.com",
    to: normalised,
    subject: "Verify your Dalhousie email for Flipt",
    text: `Click the link below to link your Dal email to your Flipt account. This link expires in 1 hour.\n\n${confirmUrl}`,
  });
}

// ── Onboarding ───────────────────────────────────────────────────────────────

export async function saveFieldOfStudy(value: string): Promise<void> {
  const { user } = await requireSession();
  if (!value.trim()) throw new Error("Field of study is required");
  await prisma.user.update({
    where: { id: user.id },
    data: { fieldOfStudy: value.trim() },
  });
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function updateTheme(
  theme: "SYSTEM" | "LIGHT" | "DARK",
): Promise<void> {
  const { user } = await requireSession();
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, theme },
    update: { theme },
  });
}

export async function updateDisplayName(name: string): Promise<void> {
  const { user } = await requireSession();
  if (!name.trim()) throw new Error("Name is required");
  await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
  });
  revalidatePath("/settings");
}

export async function deleteAccount(): Promise<void> {
  const { user } = await requireSession();
  // Delete private decks first; public/course decks will have ownerId set to null via SetNull cascade
  await prisma.deck.deleteMany({
    where: { ownerId: user.id, visibility: "PRIVATE" },
  });
  await prisma.user.delete({ where: { id: user.id } });
  redirect("/auth/sign-in");
}

// ── AI flashcard generation ───────────────────────────────────────────────────

export type GeneratedCard = {
  question: string;
  answer: string;
};

export type GenerateFlashcardsResult = {
  deckTitle: string;
  deckDescription: string;
  cards: GeneratedCard[];
};

export async function generateFlashcardsFromDocument(
  formData: FormData,
): Promise<GenerateFlashcardsResult> {
  await requireSession();

  const files = formData.getAll("file") as File[];
  if (files.length === 0) throw new Error("No files provided");

  const MAX_BYTES = 10 * 1024 * 1024;
  const { extractTextFromFile } = await import("@/lib/document-extract");

  const textParts: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) continue; // skip oversized files
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = await extractTextFromFile(buffer, file.name, file.type);
    if (text.trim()) {
      textParts.push(`--- ${file.name} ---\n${text.trim()}`);
    }
  }

  const combinedText = textParts.join("\n\n");

  if (combinedText.trim().length < 50) {
    throw new Error(
      "We couldn't read enough content from these files. Try a different format.",
    );
  }

  const { generateFlashcards } = await import("@/lib/flashcard-generate");
  const result = await generateFlashcards(combinedText);

  // Sanitize model output — strip leading punctuation/whitespace the model sometimes emits
  const cleanTitle = result.deckTitle.replace(/^[\s:,.\-–—]+|[\s:,.\-–—]+$/g, "").trim();
  const cleanDescription = result.deckDescription.replace(/^[\s:,.\-–—]+|[\s:,.\-–—]+$/g, "").trim();

  return {
    deckTitle: cleanTitle || "Untitled Deck",
    deckDescription: cleanDescription,
    cards: result.cards
      .filter((c) => c.question.trim().length > 3 && c.answer.trim().length > 3)
      .map((c) => ({
        question: c.question.trim(),
        answer: c.answer.trim(),
      })),
  };
}

export async function saveDeckFromGeneration(data: {
  title: string;
  description: string;
  coverImage: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  cards: { question: string; answer: string }[];
}): Promise<void> {
  const { user } = await requireSession();
  if (!data.title.trim()) throw new Error("Title is required");

  const deck = await prisma.deck.create({
    data: {
      ownerId: user.id,
      title: data.title.trim(),
      description: data.description.trim() || null,
      visibility: data.visibility,
      coverImage: data.coverImage || null,
    },
  });

  await prisma.flashcard.createMany({
    data: data.cards.map((card, i) => ({
      deckId: deck.id,
      question: card.question,
      answer: card.answer,
      position: i,
    })),
  });

  revalidatePath("/decks");
  redirect(`/decks/${deck.id}/edit`);
}

// ── Deck import ──────────────────────────────────────────────────────────────

export type ImportCardData = {
  question: string;
  answer: string;
  imageUrl: string | null;
};

export type ImportDeckData = {
  title: string;
  description: string | null;
  coverImage: string | null;
  cards: ImportCardData[];
};

async function mirrorImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.split("/")[1]?.split("+")[0] || "jpg";
    const filename = `deck-import-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = new Blob([arrayBuffer], { type: contentType });
    const result = await put(`imports/${filename}`, blob, { access: "public" });
    return result.url;
  } catch {
    return null;
  }
}

export async function importDeck(
  data: ImportDeckData,
): Promise<{ deckId: string }> {
  const { user } = await requireSession();

  const coverImageUrl = data.coverImage
    ? await mirrorImage(data.coverImage)
    : null;

  const deck = await prisma.deck.create({
    data: {
      ownerId: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      visibility: "PRIVATE",
      coverImage: coverImageUrl,
    },
  });

  // Mirror all card images in parallel
  const mirroredImages = await Promise.all(
    data.cards.map((c) =>
      c.imageUrl ? mirrorImage(c.imageUrl) : Promise.resolve(null),
    ),
  );

  await prisma.flashcard.createMany({
    data: data.cards.map((card, i) => ({
      deckId: deck.id,
      question: card.question,
      answer: card.answer,
      imageUrl: mirroredImages[i],
      position: i,
    })),
  });

  revalidatePath("/decks");
  return { deckId: deck.id };
}
