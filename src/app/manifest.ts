import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Recipe Manager",
    short_name: "RecipeManager",
    description: "Smarter Rezept-Manager, Kalorien-Tracker und Einkaufsliste",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#436a10",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
