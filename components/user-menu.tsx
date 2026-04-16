"use client"

import { useRouter } from "next/navigation"
import { bindTheme } from "ssr-themes/react"
import { signOut } from "@/lib/auth-client"
import { theme } from "@/app/theme"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateTheme } from "@/app/actions"

interface UserMenuProps {
  userName: string
  userEmail: string
  userImage?: string | null
}

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const

const { useTheme } = bindTheme(theme);

export function UserMenu({ userName, userEmail, userImage }: UserMenuProps) {
  const router = useRouter()
  const { selected, setSelected } = useTheme()

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    await signOut()
    router.push("/sign-in")
  }

  function handleThemeChange(value: string) {
    setSelected(value as "system" | "light" | "dark")
    const dbTheme = value.toUpperCase() as "SYSTEM" | "LIGHT" | "DARK"
    updateTheme(dbTheme)
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Avatar className="size-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={userImage ?? undefined} alt={userName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{userName}</span>
            <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Theme switcher */}
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground mb-2">Theme</p>
            <div className="flex gap-1">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md text-xs transition-colors",
                    selected === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/decks">Switch decks</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
