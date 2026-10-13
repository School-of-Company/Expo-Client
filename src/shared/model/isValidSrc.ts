// next/image 는 remotePatterns 에 없는 외부 이미지를 렌더링하면 오류를 내므로 같은 목록만 허용한다.
// next.config.mjs 의 images.remotePatterns 를 바꾸면 여기도 함께 바꾼다
const ALLOWED_REMOTE_IMAGES: { hostname: string; pathnamePrefix?: string }[] = [
  { hostname: 's3.startup-expo.kr' },
  { hostname: 'api.startup-expo.kr' },
  { hostname: 'a.glink.kr', pathnamePrefix: '/expo/image/' },
];

export const isValidSrc = (src: string | null | undefined): boolean => {
  if (!src) return false;
  // 업로드 전 미리보기
  if (src.startsWith('blob:')) return true;
  // 같은 출처 정적 경로. '//host' 는 다른 출처라 막는다
  if (src.startsWith('/')) return !src.startsWith('//');

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;

  return ALLOWED_REMOTE_IMAGES.some(
    ({ hostname, pathnamePrefix }) =>
      url.hostname === hostname &&
      (!pathnamePrefix || url.pathname.startsWith(pathnamePrefix)),
  );
};
