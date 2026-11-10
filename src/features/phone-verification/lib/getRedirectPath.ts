// TODO: 참여자용 목록 페이지가 생기면 해당 경로로 교체
export const DEFAULT_REDIRECT_PATH = '/';

/**
 * 인증 완료 후 이동할 경로를 만든다. 인증한 번호는 탭 저장소(`verifiedPhone`)와 세션 쿠키로만 전달하고
 * 주소에는 싣지 않는다(브라우저 기록·분석 도구에 개인정보가 남지 않게). 예전 링크에 남은 `phoneNumber`도 지운다.
 * 외부 도메인으로의 오픈 리다이렉트를 막기 위해 내부 경로(`/...`)만 허용한다.
 */
export const getRedirectPath = (redirect: string | null): string => {
  const isInternalPath =
    !!redirect && redirect.startsWith('/') && !redirect.startsWith('//');
  const path = isInternalPath ? redirect : DEFAULT_REDIRECT_PATH;

  const url = new URL(path, window.location.origin);
  url.searchParams.delete('phoneNumber');

  return `${url.pathname}${url.search}`;
};
