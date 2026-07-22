/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@project/database', '@project/shared', '@project/ui'],
  // Genera una imagen standalone optimizada para Docker
  output: 'standalone',
};

module.exports = nextConfig;
