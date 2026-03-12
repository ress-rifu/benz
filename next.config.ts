import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.imgbb.com" },
      { protocol: "https", hostname: "**.imgur.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

