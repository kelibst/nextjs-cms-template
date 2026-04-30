import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { ThemeProvider } from 'next-themes'
import { auth } from "@/auth";
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '@next/third-parties/google'
import { getSiteSettings } from "@/lib/site-settings";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription || 'A modern CMS and membership platform template.',
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      siteName: settings.siteName,
      images: [
        { url: "/images/placeholder.jpg", width: 1200, height: 630, alt: settings.siteName },
      ],
    },
    twitter: { card: "summary_large_image" },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()])

  const themeStyle = (settings.themePrimary || settings.themeAccent)
    ? `:root {
${settings.themePrimary ? `  --primary: ${settings.themePrimary};
  --primary-hover: color-mix(in oklch, ${settings.themePrimary} 85%, black);
  --primary-subtle: color-mix(in oklch, ${settings.themePrimary} 15%, white);
  --primary-muted: color-mix(in oklch, ${settings.themePrimary} 50%, white);
  --primary-deep: color-mix(in oklch, ${settings.themePrimary} 40%, black);` : ''}
${settings.themeAccent ? `  --accent: ${settings.themeAccent};
  --accent-foreground: white;` : ''}
}`
    : null

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <head>
        {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers session={session}>
            {children}
          </Providers>
        </ThemeProvider>
        <Toaster position="bottom-right" richColors />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
