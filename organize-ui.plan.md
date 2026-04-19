# Navigation & Decks Page Redesign

## Goal

Separate **Courses**, **Decks**, and **Collections** into distinct pages with a single responsibility each. Currently `/decks` mixes all three concepts on one screen — this is confusing and will not scale to hundreds of courses.

---

## Mental Model

| Concept | What it is | Who creates it | How you find it |
|---|---|---|---|
| **Course** | A community-maintained basket of decks for a Dal course | Admin / community | Browse a directory, pin yours |
| **Collection** | A personal basket of decks you grouped yourself | You | Always visible (you made it) |
| **Deck** | A set of flashcards | You / community | Browse your decks page |

Courses and Collections are conceptually identical (baskets of decks) and share the same inner-page UI — but they are discovered differently, so they live on separate pages.

---

## Route Structure

```
/courses                    ← Dal course directory (browse + pin)
/courses/request            ← Submit a request to add a course
/decks/course/[id]          ← (existing) Inner page for a course — keep as-is
/decks                      ← Your personal decks (+ shared + community)
/collections                ← Your personal collections
/collections/[id]           ← Inner page for a collection (same UI as course inner page)
```

Nav items (in order): **Courses** · **Decks** · **Collections**

---

## Page 1: `/courses` — Dal Course Directory

### Purpose
Browse the full indexed list of Dalhousie courses. Pin the ones you're enrolled in so they appear prominently at the top. Request courses that are missing.

### Layout

```
Pinned Courses          ← sticky section, only visible when ≥1 pinned
──────────────────────────────────────────────────────────────────
[PSYC 1011]  Introduction to Psychology    12 decks  →
[BIOL 1010]  Biology I                      8 decks  →

All Courses             ← searchable, filterable directory
──────────────────────────────────────────────────────────────────
[Search by course code or name…]    [Filter: All Faculties ▾]

Science
  [BIOL 1010]  Biology I                    8 decks  →
  [CHEM 1011]  General Chemistry I          5 decks  →
  ...

Computer Science
  [CSCI 1100]  Introduction to CS           3 decks  →
  ...

[Can't find your course?  Request it →]     ← footer CTA
```

### Behaviour
- **Pin/unpin**: star icon on each course row. Pinned courses float to the top section. Stored in DB (new `PinnedCourse` table — see schema changes).
- **Search**: client-side filter on code + name. Instant, no network call.
- **Faculty filter**: dropdown grouping by faculty. Faculties derived from course code prefix (BIOL, CHEM, PSYC, CSCI, COMM, etc.).
- **Directory is pre-indexed**: courses are not user-created here. The list comes from a seeded/admin-managed table of Dal courses.
- **Request link**: bottom of page, links to `/courses/request`.
- Clicking a course row → `/decks/course/[id]` (existing page, no change needed).
- Unauthenticated users can browse but cannot pin.

### Data
- `Collection` records with `courseCode != null` = course entries.
- A new `PinnedCourse` join table links `userId ↔ collectionId` for pinning.

---

## Page 2: `/courses/request` — Request a Course

### Purpose
Simple form for students to submit a request to add a Dal course that isn't in the directory yet.

### Layout
```
← Back to Courses

Request a Course
────────────────────────────────────
Course code      [PSYC 2060          ]
Course name      [Social Psychology  ]
Notes (optional) [                   ]

                        [Submit request]
```

### Behaviour
- Submits to a new API route: `POST /api/courses/request`
- Stores in a `CourseRequest` table with `userId`, `courseCode`, `courseName`, `notes`, `status` (pending/approved/rejected)
- One-time toast confirmation. No redirect.
- Admin reviews requests in a future admin panel (out of scope for this plan).
- Rate-limited to 3 requests per user per day.

### Data
- New `CourseRequest` model in schema.

---

## Page 3: `/decks` — Your Decks

### Purpose
Personal workspace. Only decks — no courses, no collections navigation here.

### Layout (authenticated)
```
Your Decks
──────────────────────────────────────────────────────────────────
[Search decks…]              [Newest ▾]    [+ New deck]

★ Favorites
  [deck card]  [deck card]  [deck card]

Your Decks
  [deck card]  [deck card]  ...

Shared with me
  [deck card]  ...

Community
  [deck card]  ...
```

### Changes from current
- **Remove** the Dal Courses section entirely from this page.
- **Remove** the CollectionStrip from this page (collections are on their own page now).
- Everything else stays: search, sort, section groupings, floating study session bar, favorites, pagination ("Load more").
- The `+ New deck` button and the `Regen All Covers` dev button stay.

### Layout (unauthenticated)
- Community decks only. No courses section. Same as today minus the courses block.

---

## Page 4: `/collections` — Your Collections

### Purpose
View and manage your personal collections (user-created baskets of decks).

### Layout
```
My Collections
──────────────────────────────────────────────────────────────────
[+ New collection]

[Collection card]   [Collection card]   [Collection card]
  "Exam prep"         "Bio notes"         "Shared deck set"
  8 decks             4 decks             2 decks

(empty state if none: "No collections yet. Create one to group your decks.")
```

### Collection card design
- Same card dimensions as a course card on `/courses`
- Shows: name, deck count, cover (gradient fallback same as deck cards)
- Hover: show "Edit name" and "Delete" actions

### Behaviour
- **Create**: inline name input appears at top of grid when "+ New collection" is clicked
- **Rename**: click pencil on card → inline edit
- **Delete**: click trash on card → confirm dialog → delete
- **Click card**: navigate to `/collections/[id]`

---

## Page 5: `/collections/[id]` — Collection Inner Page

### Purpose
View and study the decks inside a personal collection.

### Layout
Identical to `/decks/course/[id]` — same `PageLayout` + `CourseDeckView` (or a renamed shared component).

```
← My Collections

[Collection Name]                    8 decks · Your collection
──────────────────────────────────────────────────────────────────
[deck card]  [deck card]  [deck card]
[deck card]  ...

[Start studying all]
```

### Implementation note
`CourseDeckView` should be renamed to something generic like `BasketDeckView` or `CollectionDeckView` and reused for both course and personal collection inner pages. The only difference: course pages show a `courseCode` badge; collection pages do not.

---

## Schema Changes

### 1. New: `PinnedCourse` table

```prisma
model PinnedCourse {
  userId       String
  collectionId String
  pinnedAt     DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([userId, collectionId])
  @@index([userId])
}
```

Add `pinnedCourses PinnedCourse[]` to `User` and `Collection` models.

### 2. New: `CourseRequest` table

```prisma
model CourseRequest {
  id         String              @id @default(cuid())
  userId     String
  courseCode String
  courseName String
  notes      String?
  status     CourseRequestStatus @default(PENDING)
  createdAt  DateTime            @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
}

enum CourseRequestStatus {
  PENDING
  APPROVED
  REJECTED
}
```

Add `courseRequests CourseRequest[]` to `User`.

### 3. Remove `createCourseCollection` from client-accessible actions
Course creation (adding a new course to the directory) should no longer be a user-facing action. The existing `createCourseCollection` server action and its inline form in `DeckSelection` get removed. This flow moves entirely to the admin path or the request flow.

---

## Component Changes

| Component | Action |
|---|---|
| `components/deck-selection.tsx` | Remove Dal Courses block, remove `CollectionStrip`, remove `isAddingCourse` state and form |
| `components/collection-strip.tsx` | Delete entirely — no longer needed on `/decks` |
| `components/course-decks-view.tsx` | Rename to `components/basket-deck-view.tsx`; accept optional `courseCode` prop for badge |
| `app/(public)/decks/course/[id]/page.tsx` | Update import to `basket-deck-view` |
| `app/(public)/decks/page.tsx` | Remove `courseCollections` query and prop |

### New components
| Component | Purpose |
|---|---|
| `components/course-directory.tsx` | Client component for `/courses` — search, filter, pin/unpin |
| `components/course-row.tsx` | Single row in the course directory |
| `components/collection-grid.tsx` | Grid of user collection cards on `/collections` |
| `components/collection-card.tsx` | Single collection card with inline rename/delete |

### New pages/routes
| File | Purpose |
|---|---|
| `app/(public)/courses/page.tsx` | Course directory (auth-aware: shows pin controls if logged in) |
| `app/(protected)/courses/request/page.tsx` | Request form (auth required) |
| `app/(protected)/collections/page.tsx` | User's personal collections |
| `app/(protected)/collections/[id]/page.tsx` | Inner page for a collection |
| `app/api/courses/request/route.ts` | POST handler for course requests |
| `app/api/courses/[id]/pin/route.ts` | POST/DELETE handler for pin/unpin |

---

## Nav Changes

Current nav items (unknown exact implementation — check sidebar/nav component).

Target nav items:
1. **Courses** → `/courses`
2. **Decks** → `/decks`
3. **Collections** → `/collections`

Back links:
- `/decks/course/[id]` back link changes from "All decks" → "Courses"
- `/collections/[id]` back link → "My Collections"

---

## Out of Scope (this plan)

- Admin panel for approving course requests
- Course cover images / faculty icons
- Sorting/ordering pinned courses
- Collection sharing (making a collection public)
- Importing a community deck directly into a personal collection from the deck page
