import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Skip Next.js image optimization proxy entirely.
    // MinIO serves files directly and Nginx handles caching, so no benefit
    // from proxying through Next.js — and it breaks localhost (private IP block).
    unoptimized: true,
  },
};

export default nextConfig;
