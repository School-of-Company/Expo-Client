import { cookies } from 'next/headers';

export function setAuthCookies({
  accessToken,
  refreshToken,
  accessTokenExpires,
  refreshTokenExpires,
}: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: Date;
  refreshTokenExpires: Date;
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
