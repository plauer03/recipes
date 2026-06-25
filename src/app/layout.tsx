import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppNavigation } from "@/components/AppNavigation";
import { TopHeader } from "@/components/TopHeader";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "Smart Recipe Manager & Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recipe Manager",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="h-[100dvh] overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center h-[100dvh] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 font-sans`}
      >
        <Providers>
          <div className="w-full max-w-[450px] h-[100dvh] bg-[var(--background)] flex flex-col relative overflow-hidden shadow-2xl transition-colors duration-300">
            <TopHeader />
            <main className="flex-1 w-full relative overflow-y-auto no-scrollbar pb-24">
              {children}
            </main>
            <AppNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
