const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storacha.link',
        pathname: '/ipfs/**',
      },
    ],
  },
};

module.exports = nextConfig;
