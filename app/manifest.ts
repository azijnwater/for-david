import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sucuk Photo Archive",
    short_name: "Sucuk",
    description: "A small life, closely observed.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2efe7",
    theme_color: "#12120f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
