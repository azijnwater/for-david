import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buurtvader.vercel.app"),
  alternates: { canonical: "/" },
  title: "Sucuk — Small cat, big life",
  description:
    "A drifting photo archive of one small cat's ordinary days, soft landings, and favorite places.",
  openGraph: {
    url: "/",
    siteName: "Sucuk Photo Archive",
    title: "Sucuk — Small cat, big life",
    description: "A small life, closely observed.",
    type: "website",
    images: [
      {
        url: "/photos/sucuk-07.jpg",
        width: 2409,
        height: 3200,
        alt: "A close portrait of Sucuk resting with sleepy eyes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sucuk — Small cat, big life",
    description: "A small life, closely observed.",
    images: ["/photos/sucuk-07.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2efe7" },
    { media: "(prefers-color-scheme: dark)", color: "#12120f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
