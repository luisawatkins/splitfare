const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/storacha\.link\/ipfs\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'ipfs-content',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 365 * 24 * 60 * 60, 
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^\/api\/users\/me.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'user-data',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60, 
        },
      },
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, 
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2?|png|svg|jpg|jpeg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, 
        },
      },
    },
  ],
});

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

module.exports = withPWA(nextConfig);
