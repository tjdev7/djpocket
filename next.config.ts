import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

module.exports = nextConfig;