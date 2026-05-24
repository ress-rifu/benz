import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

