import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { DustOverlay } from "@/components/dust-overlay";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  title: "Flipt",
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
  let defaultTheme = "system";
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
      const settings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
        select: { theme: true },
      });
      if (settings?.theme) defaultTheme = settings.theme.toLowerCase();
    }
  } catch {}

  return (
    <html
      lang="en"
      className={`${_geist.variable} ${_geistMono.variable} ${_instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-svh">
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem
          disableTransitionOnChange
        >
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
