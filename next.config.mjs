/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'startup-expo-bucket.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
