import { cookies } from 'next/headers';

const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * 서버가 주는 만료 시각을 읽는다. 오프셋이 없으면 UTC 로 본다.
 * 못 읽으면 undefined 를 돌려 세션 쿠키로 둔다(Invalid Date 로 쿠키를 굽지 않는다)
 */
export function parseExpiresAt(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const date = new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function setAuthCookies({
  accessToken,
  refreshToken,
  accessTokenExpires,
  refreshTokenExpires,
}: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires?: Date;
  refreshTokenExpires?: Date;
}) {
  const cookieStore = cookies();
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    expires: accessTokenExpires,
    sameSite: 'strict',
  });
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    expires: refreshTokenExpires,
    sameSite: 'strict',
  });
}
