import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "talentra.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
