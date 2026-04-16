# Share Deck Feature — Implementation Plan

## Decisions made

- **Two visibility tiers:** Private and Public. No "link sharing" or "Dal only" tier.
- **Private decks** can only be shared by inviting specific users inside the app.
- **Public decks** are open to everyone, discoverable without login, and indexable by search engines. Anyone can copy the URL — no extra permissions layer needed.
- **Non-logged-in visitors** can see the full deck (all cards). At the end, they see a "more decks you might like" section and sign-up prompts for progress tracking, saving, etc.

---

## What already exists

- `Visibility` enum with `PRIVATE` and `PUBLIC` — already in the schema
- `/decks/[id]` page — already handles public vs private access, shows a 5-card preview
- Fork (clone) deck button — already exists for logged-in users viewing public decks
- `/decks` page — lists user decks and public decks, but requires login

---

## Phase 0: Route restructure + URL design

### URL structure

No `/app` prefix. All routes live at the top level. Pages either adapt to auth state or require login — enforced by route groups in the file system, not by URL.

```
Public (no login required, adapts if logged in)
  /                     Landing page
  /decks                All decks — public decks for everyone, plus your private/shared decks if logged in
  /decks/[id]           View a deck — full cards for public decks, stats + study button if logged in
  /sign-in              Auth pages
  /sign-up
  /forgot-password
  /reset-password
  /verify-dal

Protected (login required, redirects to /sign-in)
  /decks/new            Create a deck
  /decks/[id]/edit      Edit a deck (owner only)
  /decks/import         Import a deck
  /study                Study session
  /settings             User settings
```

### Auth pattern: Next.js route groups

Use parenthesized route groups to organize auth without affecting URLs:

```
app/
  (public)/
    page.tsx                  ← /         (landing page)
    decks/page.tsx            ← /decks    (browse + your decks)
    decks/[id]/page.tsx       ← /decks/[id]
  (protected)/
    layout.tsx                ← shared auth check: getSession(), redirect if null
    decks/new/page.tsx        ← /decks/new
    decks/[id]/edit/page.tsx  ← /decks/[id]/edit
    decks/import/page.tsx     ← /decks/import
    study/page.tsx            ← /study
    settings/page.tsx         ← /settings
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    verify-dal/page.tsx
```

- **`(protected)/layout.tsx`** checks the session once — all child pages inherit it, no repetition
- **`(public)/`** pages call `getSession()` optionally and adapt their UI
- Route groups are invisible in the URL — `/decks/new` not `/(protected)/decks/new`

### 0a. `/` becomes a public landing page

The root route (`/`) becomes a marketing/landing page. No login required.

- Hero section: what flashcardbrowser is, why it's useful
- Show some featured public decks to give visitors a taste
- Clear CTAs to sign up or sign in
- Link to `/decks` to browse more
- SEO-optimized, this is the front door of the app

### 0b. `/decks` becomes one unified page

Currently `/decks` requires login. Change it to work for everyone:

- **Not logged in:** shows public decks only — browse, search, discover
- **Logged in:** shows your private decks + shared with you + public decks, in sections
- One page, one URL, adapts to auth state

---

## Phase 1: Public deck experience

### 1a. Update `/decks/[id]` for non-logged-in users

The page already works for non-logged-in users on public decks, but currently only shows 5 cards.

- Show **all cards** in the preview for non-logged-in users (not just 5)
- Add a "more decks you might like" section at the bottom (other public decks — start with same owner or recent, proper recommendations later)
- Sign-up CTAs: "Track your progress," "Save this deck," "Study with spaced repetition"
- Keep stats section hidden for non-logged-in users (already the case)

### 1b. `/decks` browse experience for non-logged-in users

- Search/filter by title
- Sorted by popularity or recency (start with recency, add popularity later)
- Server-rendered for SEO

### 1c. SEO basics

- Add `<title>` and `<meta description>` to public deck pages using the deck title/description
- Add Open Graph tags so shared links look good on social media
- Consider a `/sitemap.xml` that includes all public decks

---

## Phase 2: Private deck sharing (invite specific users)

### 2a. Schema changes

Add a `DeckShare` model to track who a private deck has been shared with:

```
model DeckShare {
  deckId    String
  userId    String
  createdAt DateTime @default(now())

  deck Deck @relation(...)
  user User @relation(...)

  @@id([deckId, userId])
}
```

Add the relation to `Deck` and `User` models.

### 2b. Share flow

- On the deck detail page (owner view), add a "Share" button for private decks
- Opens a modal/sheet where the owner can search for users by name or email
- Owner selects a user, they get added to the `DeckShare` table
- Owner can see who the deck is shared with and remove access

### 2c. Access control updates

Update `/decks/[id]` access check:

- Currently: private deck → must be owner, otherwise 404
- New: private deck → must be owner **or** in the `DeckShare` table, otherwise 404

### 2d. Shared decks in the user's deck list

- On `/decks`, add a "Shared with me" section showing private decks others have shared with you
- These decks are read-only (can study, can't edit)
- Option to fork/clone into your own deck

---

## Phase 3: End-of-deck experience (non-logged-in)

After flipping through all cards on a public deck without being logged in:

- "More decks you might like" — grid of other public decks
- "Want to remember these?" — explain what spaced repetition does, CTA to sign up
- "Save this deck to your collection" — CTA to sign up
- Keep it simple — this is a conversion funnel, not a feature

---

## Phase 4: Update README with route testing index

After implementation, add a route index to the README grouped by auth requirement. Each entry should list the route, whether login is needed, and what you should see — so you can quickly open each page and verify everything works.

---

## Out of scope (for now)

- Collaborative editing (multiple editors on one deck)
- "Dal only" visibility tier
- Notifications when someone shares a deck with you (can just show in their deck list)
- Recommendation algorithm for "more decks you might like" (start with simple: same owner, recent, popular)
