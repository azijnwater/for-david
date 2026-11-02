import type { MetadataRoute } from "next";
import { games, gameSlug } from "@/lib/arcade/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://buurtvader.vercel.app",
      lastModified: new Date("2026-11-02"),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...games.map((game) => ({
      url: `https://buurtvader.vercel.app/${gameSlug(game)}`,
      lastModified: new Date("2026-11-02"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
