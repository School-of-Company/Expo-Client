// TODO: 참여자용 목록 페이지가 생기면 해당 경로로 교체
export const DEFAULT_REDIRECT_PATH = '/';

/**
 * 인증 완료 후 이동할 경로에 인증된 전화번호를 쿼리로 붙인다.
 * 외부 도메인으로의 오픈 리다이렉트를 막기 위해 내부 경로(`/...`)만 허용한다.
 */
export const getRedirectPath = (
  redirect: string | null,
  phoneNumber: string,
): string => {
  const isInternalPath =
    !!redirect && redirect.startsWith('/') && !redirect.startsWith('//');
  const path = isInternalPath ? redirect : DEFAULT_REDIRECT_PATH;

  const url = new URL(path, window.location.origin);
  url.searchParams.set('phoneNumber', phoneNumber);

  return `${url.pathname}${url.search}`;
};
