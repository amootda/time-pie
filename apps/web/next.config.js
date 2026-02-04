const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@time-pie/ui', '@time-pie/core', '@time-pie/supabase'],
  turbopack: {},
}

module.exports = withPWA(nextConfig)
