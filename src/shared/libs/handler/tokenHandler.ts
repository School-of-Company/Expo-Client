import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAuthCookies } from '../cookie/deleteCookies';
import { handleError } from './error';
import { parseRequestData, sendRequest } from './request';
import { createResponse } from './response';
import { performTokenRefresh } from './token';

export async function tokenHandleRequest(
  req: NextRequest,
  originalBody?: string | FormData,
): Promise<NextResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    const res = NextResponse.json(
      { error: 'Refresh token 없음', status: 401, isRefreshError: true },
      { status: 401 },
    );
    return deleteAuthCookies(res);
  }

  const { requestData, headers } = await parseRequestData(req, originalBody);
  const isFileDownload =
    req.headers.get('X-File-Download') === 'true' ||
    req.nextUrl.pathname.includes('/excel/');

  async function doRequest(token?: string) {
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await sendRequest(req, token, requestData, headers);
    return createResponse(resp, isFileDownload);
  }

  const existingToken = cookieStore.get('accessToken')?.value;
  try {
    return await doRequest(existingToken);
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.response?.status === 401) {
      const newTokens = await performTokenRefresh(refreshToken);
      if (!newTokens) {
        const res = NextResponse.json(
          { error: '토큰 갱신 실패', status: 401, isRefreshError: true },
          { status: 401 },
        );
        return deleteAuthCookies(res);
      }
      try {
        return await doRequest(newTokens.accessToken);
      } catch (err) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status && status !== 401) {
          return createResponse(axiosErr.response!, false);
        }
        const res = NextResponse.json(
          {
            error: '토큰 재발급 후 재시도 실패',
            status: 401,
            isRefreshError: true,
          },
          { status: 401 },
        );
        return deleteAuthCookies(res);
      }
    }

    return handleError(err);
  }
}
