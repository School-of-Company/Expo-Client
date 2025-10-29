/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.startup-expo.kr/image',
        hostname: 'expo-image-bucket-9881.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'api.startup-expo.kr',
      },
    ],
  },
};

export default nextConfig;
