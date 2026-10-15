import { Readable } from 'stream';
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
import { RefreshUnavailableError } from './refreshAccessToken';
import { parseRequestData, sendRequest } from './request';
import { createResponse } from './response';
import { performTokenRefresh } from './token';

// 읽지 않을 다운로드 오류 스트림은 닫아 연결이 붙잡혀 있지 않게 한다. 재시도는 새 요청으로 새 스트림을 받는다
const discardBody = (error: AxiosError) => {
  const data = error.response?.data;
  if (data instanceof Readable) data.destroy();
};

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
      discardBody(axiosErr);
      let newTokens: Awaited<ReturnType<typeof performTokenRefresh>>;
      try {
        newTokens = await performTokenRefresh(refreshToken);
      } catch (refreshError) {
        if (!(refreshError instanceof RefreshUnavailableError))
          throw refreshError;
        // 일시 장애는 쿠키를 지키고 재시도하게 한다
        return NextResponse.json(
          { error: refreshError.message, status: 503 },
          { status: 503 },
        );
      }
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
        // 첫 시도와 같이 처리해야 파일 다운로드의 스트림 오류 본문도 문구로 풀린다
        if (status && status !== 401) {
          return handleError(err);
        }
        discardBody(axiosErr);
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
