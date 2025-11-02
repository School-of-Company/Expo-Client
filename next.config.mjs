/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.startup-expo.kr',
      },
      {
        protocol: 'https',
        hostname: 'api.startup-expo.kr',
      },
    ],
  },
};

export default nextConfig;
