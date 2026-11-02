import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sucuk Photo Archive",
    short_name: "Sucuk",
    description: "Celebrating two years of Sucuk.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff6d9",
    theme_color: "#9d231f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
