import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/start-a-church", destination: "/start", permanent: false },
      { source: "/my-church", destination: "/app/group", permanent: false },
    ];
  },
  async headers() {
    return [
      { source: "/app", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/app/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eeeprmtermreavivzswn.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
