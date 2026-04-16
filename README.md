# flashcardbrowser

Flashcard app built with Next.js 15, shadcn/ui, and Prisma.

## Commands

```bash
bun dev        # Start development server
bun build      # Build for production
bun start      # Start production server
bun lint       # Run ESLint
```

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

### Migrations

```bash
bunx --bun prisma migrate dev   # Create and apply a migration
bunx --bun prisma studio        # Open database GUI
```
