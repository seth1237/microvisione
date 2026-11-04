import type { NextConfig } from "next";
import { accordApiUrl } from "./lib/platform/backend-url";

const apiUrl = accordApiUrl();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/products", destination: "/", permanent: false },
      { source: "/offers", destination: "/gallery", permanent: false },
      { source: "/offers/:path*", destination: "/gallery", permanent: false },
    ];
  },
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
    dangerouslyAllowLocalIP: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "micro.codewithseth.co.ke", pathname: "/api/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/api/media/**" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/api/media/**" },
    ],
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
