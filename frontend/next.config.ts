import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/py-api/index.py",
      },
      {
        source: "/symptoms",
        destination: "/py-api/index.py",
      },
      {
        source: "/predict-disease",
        destination: "/py-api/index.py",
      },
      {
        source: "/recommendations/:path*",
        destination: "/py-api/index.py",
      },
      {
        source: "/analyze-medical-image",
        destination: "/py-api/index.py",
      },
      {
        source: "/scan-prescription",
        destination: "/py-api/index.py",
      },
      {
        source: "/medicines/:path*",
        destination: "/py-api/index.py",
      },
      {
        source: "/checkout",
        destination: "/py-api/index.py",
      },
      {
        source: "/health/:path*",
        destination: "/py-api/index.py",
      }
    ];
  },
};

export default nextConfig;
