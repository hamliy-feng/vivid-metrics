import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vivid-metrics",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
