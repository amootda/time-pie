/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@time-pie/ui', '@time-pie/core', '@time-pie/supabase'],
  turbopack: {},
}

module.exports = nextConfig
