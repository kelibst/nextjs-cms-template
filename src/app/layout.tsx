import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { ThemeProvider } from 'next-themes'
import { auth } from "@/auth";
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GAPHTO — Ghana Association of Public Health Technical Officers",
    template: "%s | GAPHTO",
  },
  description:
    "Ghana Association of Public Health Technical Officers — Public Health, Our Concern. Serving since 1984.",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://gaphto.org",
    siteName: "GAPHTO",
    images: [
      { url: "/images/placeholder.jpg", width: 1200, height: 630, alt: "GAPHTO" },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
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
