import { cookies } from 'next/headers';

export const clearAuthCookies = () => {
  const cookieStore = cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
};
