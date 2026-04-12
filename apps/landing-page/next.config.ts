import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/landing",
        destination: "/",
        permanent: false,
      },
      {
        source: "/landing/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
