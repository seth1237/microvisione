import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { palette } from "@/styles/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.positioning,
    start_url: "/",
    display: "standalone",
    background_color: palette.paper,
    theme_color: palette.brandBlue,
    lang: "en",
    icons: [
      { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
