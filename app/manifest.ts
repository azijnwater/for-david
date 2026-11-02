import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sucuk Photo Archive",
    short_name: "Sucuk",
    description: "Celebrating two years of Sucuk.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9dde8",
    theme_color: "#25235e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
