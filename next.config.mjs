/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Proxy body size limit (Next.js 16 with Turbopack)
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
