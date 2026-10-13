import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAuthCookies } from '../cookie/deleteCookies';
import { handleError } from './error';
import {
  forbiddenPathResponse,
  isFileDownloadRequest,
  toGatewayUrl,
} from './proxyTarget';
import { parseRequestData, sendRequest } from './request';
import { createResponse } from './response';
import { performTokenRefresh } from './token';

export async function tokenHandleRequest(
  req: NextRequest,
  originalBody?: string | FormData,
): Promise<NextResponse> {
  const gatewayUrl = toGatewayUrl(req, '/api/server/token');
  if (!gatewayUrl) return forbiddenPathResponse();
  const url = gatewayUrl;

  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    const res = NextResponse.json(
      {
        error: 'Refresh token 없음',
        status: 401,
        isRefreshError: true,
      },
      { status: 401 },
    );
    return deleteAuthCookies(res);
  }

  let parsed: Awaited<ReturnType<typeof parseRequestData>>;
  try {
    parsed = await parseRequestData(req, originalBody);
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 본문입니다.', status: 400 },
      { status: 400 },
    );
  }
  const { requestData, headers } = parsed;
  const isFileDownload = isFileDownloadRequest(req);

  async function doRequest(token?: string) {
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await sendRequest(req, url, token, requestData, headers);
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
          {
            error: '토큰 갱신 실패',
            status: 401,
            isRefreshError: true,
          },
          { status: 401 },
        );
        return deleteAuthCookies(res);
      }

      try {
        return await doRequest(newTokens.accessToken);
      } catch (err) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        // 첫 시도와 같이 처리해야 파일 다운로드의 arraybuffer 오류 본문도 문구로 풀린다
        if (status && status !== 401) {
          return handleError(err);
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
