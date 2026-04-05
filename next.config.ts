import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence turbopack root warning
  turbopack: {
    root: __dirname,
  },
  // Cloudflare Pages image support
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
