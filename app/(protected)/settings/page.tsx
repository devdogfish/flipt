import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { SettingsProfileForm } from "@/components/settings-profile-form"
import { SettingsThemeSelector } from "@/components/settings-theme-selector"
import { SettingsApiKeys } from "@/components/settings-api-keys"

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="min-h-svh px-5 py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to decks
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight mb-10">Settings</h1>

        <section className="mb-10">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Profile
          </h2>
          <SettingsProfileForm currentName={session.user.name ?? ""} />
        </section>

        <Separator className="my-8" />

        <section className="mb-10">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Appearance
          </h2>
          <SettingsThemeSelector />
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
            API Keys
          </h2>
          <SettingsApiKeys
            keys={apiKeys.map((k) => ({
              id: k.id,
              name: k.name,
              createdAt: k.createdAt.toISOString(),
              lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
            }))}
          />
        </section>
      </div>
    </main>
  )
}
