import { cookies } from 'next/headers';

export const setAuthCookies = (tokens: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}) => {
  const cookieStore = cookies();

  cookieStore.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: true,
    expires: new Date(tokens.accessTokenExpiresIn),
    sameSite: 'strict',
  });

  cookieStore.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: new Date(tokens.refreshTokenExpiresIn),
    sameSite: 'strict',
  });
};
