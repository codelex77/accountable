import type { NextConfig } from "next";

// Using require here is completely fine since next-pwa doesn't always ship with native ESM types
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* your other config options here */
};

export default withPWA(nextConfig);
