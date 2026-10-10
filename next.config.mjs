/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    // 입장 QR 링크에는 입장 코드나 전화번호(연수자)가 들어가므로 Referer·캐시·검색 노출을 막는다
    return [
      {
        source: '/qr',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
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
