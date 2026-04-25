# Flashcardbrowser

A minimalistic, low-friction, effective, flashcard app for Dalhousie students, built using Next.js 16, shadcn/ui, and Prisma.

## Commands

```bash
bun dev        # Start development server
bun build      # Build for production
bun start      # Start production server
bun lint       # Run ESLint
```

## Route Index

### Public — no auth required

| Route         | Description                      |
| ------------- | -------------------------------- |
| `/`           | Landing page                     |
| `/decks`      | Browse all public decks          |
| `/decks/[id]` | View a single public deck        |
| `/study/[id]` | Study a deck (public study mode) |
| `/shortcuts`  | Keyboard shortcuts reference     |
| `/docs`       | Documentation                    |

### Auth — redirects to `/` if already signed in

| Route                   | Description                       |
| ----------------------- | --------------------------------- |
| `/auth/sign-in`         | Sign in                           |
| `/auth/sign-up`         | Create account                    |
| `/auth/forgot-password` | Request password reset            |
| `/auth/reset-password`  | Set new password (via email link) |

### Onboarding — requires auth, redirects to `/` if already complete

| Route         | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `/onboarding` | Dal email + field-of-study setup (required before accessing protected routes) |

### Protected — requires auth + completed onboarding (`dalEmail` + `fieldOfStudy` set)

| Route              | Description                      |
| ------------------ | -------------------------------- |
| `/study`           | Personal study session dashboard |
| `/decks/new`       | Create a new deck                |
| `/decks/import`    | Import a deck                    |
| `/decks/[id]/edit` | Edit a deck                      |
| `/settings`        | Account settings                 |

### API

| Route                                  | Auth      | Description                        |
| -------------------------------------- | --------- | ---------------------------------- |
| `/api/auth/[...all]`                   | —         | Better Auth handler                |
| `/api/verify-dal/confirm`              | —         | Confirm Dal email verification     |
| `/api/decks`                           | Protected | List / create decks                |
| `/api/decks/[id]`                      | Protected | Get / update / delete a deck       |
| `/api/decks/[id]/export`               | Protected | Export deck                        |
| `/api/collections`                     | Protected | List / create collections          |
| `/api/collections/[id]`                | Protected | Get / update / delete a collection |
| `/api/collections/[id]/decks/[deckId]` | Protected | Add / remove deck from collection  |
| `/api/upload`                          | Protected | Upload file                        |
| `/api/cron/merge-suggestions`          | Cron      | Nightly merge suggestion job       |

## Database

Local PostgreSQL via Docker — no password, trust auth.

```bash
bun db:start   # Start the container (first run creates it; after restarts/stops, resumes it)
bun db:stop    # Stop the container
```

- Container name: `flashcardbrowser-db`
- Port: `5432`
- User: `postgres`
- Database: `flashcardbrowser`
- Connection string: `postgresql://postgres@localhost:5432/flashcardbrowser`

Data persists across `db:stop` / `db:start` cycles. To wipe and start fresh:

```bash
docker rm -f flashcardbrowser-db
bun db:start
```
