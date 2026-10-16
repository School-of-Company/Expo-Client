/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // 박람회별 사전등록 관리는 /admin/registration/{id} 로 옮겼다. 예전 주소·즐겨찾기는 새 주소로 보낸다
  async redirects() {
    return [
      {
        source: '/admin/future-edu-expo/:expoId/:path*',
        destination: '/admin/registration/:expoId/:path*',
        permanent: false,
      },
      // 프로그램 조회·출석, 일정·모집, 프로그램 폼 목록은 프로그램 페이지 한 화면에 모았다
      {
        source: '/program/:expoId',
        destination: '/admin/registration/:expoId/programs',
        permanent: false,
      },
      {
        source: '/admin/registration/:expoId/schedule',
        destination: '/admin/registration/:expoId/programs',
        permanent: false,
      },
      {
        source: '/admin/registration/:expoId/program-forms',
        destination: '/admin/registration/:expoId/programs',
        permanent: false,
      },
      // 폼 만들기·편집은 따로 여는 화면이라 경로만 옮겼다
      {
        source: '/admin/registration/:expoId/program-forms/:path+',
        destination: '/admin/registration/:expoId/programs/forms/:path+',
        permanent: false,
      },
      // 참가자 명단은 접수대장 페이지의 입장자 명단 탭으로 합쳤다
      {
        source: '/exhibition/participants/:expoId',
        destination: '/admin/registration/:expoId/applications?view=roster',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      // 모든 경로 공통 보안 헤더. 스크립트·스타일 CSP는 카카오맵·GA 등 외부 스크립트가 깨지므로 frame-ancestors만 둔다
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // 인증한 전화번호가 리다이렉트 쿼리에 실리므로 다른 출처로는 경로·쿼리를 보내지 않는다
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 체크인 화면의 카메라 QR 스캔만 같은 출처에서 카메라를 쓴다. 마이크·위치는 쓰지 않는다
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
      // 입장 QR 링크에는 입장 코드나 전화번호(연수자)가 들어가므로 Referer·캐시·검색 노출을 막는다
      // 공통 규칙보다 뒤에 두어 Referrer-Policy를 no-referrer로 덮어쓴다
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
      {
        protocol: 'https',
        hostname: 'a.glink.kr',
        pathname: '/expo/image/**',
      },
    ],
  },
};

export default nextConfig;
