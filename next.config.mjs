/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      { source: '/dashboard', destination: '/' },
      { source: '/orders', destination: '/' },
      { source: '/deposit', destination: '/' },
      { source: '/pricing', destination: '/' },
      { source: '/support', destination: '/' },
      { source: '/account', destination: '/' },
    ];
  },
};

export default nextConfig;
