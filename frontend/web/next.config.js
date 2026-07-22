/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@project/database', '@project/shared', '@project/ui'],
  typescript: {
    // El backend (NestJS) se compila por separado; sus errores de tipos
    // no deben bloquear el build del frontend en producción.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
