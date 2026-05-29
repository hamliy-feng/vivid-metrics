import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vivid-metrics",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
