/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@project/database', '@project/shared', '@project/ui'],
};

module.exports = nextConfig;
