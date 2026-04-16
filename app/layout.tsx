import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { DustOverlay } from "@/components/dust-overlay";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const _instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "flashcardbrowser",
  description: "A minimalist flashcard experience",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let sessionUser: {
    name: string;
    email: string;
    image?: string | null;
  } | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      sessionUser = {
        name: session.user.name ?? "",
        email: session.user.email,
        image: session.user.image,
      };
    }
  } catch {}

  return (
    <html
      lang="en"
      className={`${_geist.variable} ${_geistMono.variable} ${_instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-svh">
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
        <div className="w-full bg-amber-400 dark:bg-amber-500 text-amber-950 text-sm font-medium text-center px-4 py-2.5">
          Flipt is currently under development — some features may be
          unavailable or change without notice.
        </div>
        <ThemeProvider>
          <DustOverlay />
          {sessionUser && (
            <UserMenu
              userName={sessionUser.name}
              userEmail={sessionUser.email}
              userImage={sessionUser.image}
            />
          )}
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
