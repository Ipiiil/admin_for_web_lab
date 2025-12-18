const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};
module.exports = nextConfig;
