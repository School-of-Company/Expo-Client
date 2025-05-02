/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'expo-image-bucket-9881.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
