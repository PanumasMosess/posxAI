import type { NextConfig } from "next";
// import withPWAInit from "@ducanh2912/next-pwa";

// const withPWA = withPWAInit({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
// });

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "wallpapercave.com",
      },
      {
        protocol: "https",
        hostname: "imgcp.aacdn.jp",
      },
      {
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// export default withPWA(nextConfig);
export default nextConfig;
