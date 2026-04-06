import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/aigirlfriend",
        destination: "https://toxic-ai-girlfriend.vercel.app/aigirlfriend",
      },
      {
        source: "/aigirlfriend/:path*",
        destination: "https://toxic-ai-girlfriend.vercel.app/aigirlfriend/:path*",
      },
    ];
  },
};

export default nextConfig;
