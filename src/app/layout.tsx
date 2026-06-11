import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
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
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
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
    <html lang="de" suppressHydrationWarning className="h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center h-full bg-[var(--background)] transition-colors duration-300`}
      >
        <Providers>
          <div className="w-full max-w-[450px] h-full bg-[var(--background)] flex flex-col relative overflow-hidden shadow-2xl transition-colors duration-300">
            <main className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 overflow-y-auto no-scrollbar p-4 pb-32 pt-[env(safe-area-inset-top)]">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
