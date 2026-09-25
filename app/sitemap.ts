import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://buurtvader.vercel.app",
      lastModified: new Date("2026-09-24"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
