import type { NextConfig } from "next";
import { accordApiUrl } from "./lib/platform/backend-url";

const apiUrl = accordApiUrl();

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api", destination: `${apiUrl}/api` },
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
    ];
  },
  serverExternalPackages: ["mysql2", "mongodb", "sharp", "cloudinary"],
  cacheComponents: true,
  partialPrefetching: true,
  // Dev HMR and the React debug channel are blocked unless the browser host is listed.
  // The server is bound on 0.0.0.0 and opened at 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
