import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buurtvader.vercel.app"),
  alternates: { canonical: "/" },
  title: "Sucuk turns two — The birthday edition",
  description:
    "Celebrating Sucuk’s second birthday: two years of little adventures, serious naps, and favorite moments. Explore the photo archive and join the birthday edition.",
  openGraph: {
    url: "/",
    siteName: "Sucuk Photo Archive",
    title: "Sucuk turns two — The birthday edition",
    description: "Small cat. Big birthday. Celebrate two years of Sucuk.",
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
    title: "Sucuk turns two — The birthday edition",
    description: "Small cat. Big birthday. Celebrate two years of Sucuk.",
    images: ["/photos/sucuk-07.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9dde8" },
    { media: "(prefers-color-scheme: dark)", color: "#25235e" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} antialiased`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
