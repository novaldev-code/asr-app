import type { NextConfig } from "next";

const apiBaseUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
);

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: apiBaseUrl.protocol === "https:" ? "https" : "http",
        hostname: apiBaseUrl.hostname,
        ...(apiBaseUrl.port ? { port: apiBaseUrl.port } : {}),
        pathname: "/uploads/**",
      },
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
