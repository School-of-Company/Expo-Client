import { AxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { toServerMessage } from './serverMessage';

// 참가자 화면이 쓰는 서버 세션 쿠키만 서버로 넘긴다. 관리자 로그인 토큰 쿠키는 공개 요청에 싣지 않는다
// JSESSIONID 는 Application 서버 내 일행 조회·취소가 공유하는 세션이다
const FORWARDED_COOKIES = ['PARTICIPANT_SESSION', 'XSRF-TOKEN', 'JSESSIONID'];

const pickForwardedCookies = (req: NextRequest) =>
  FORWARDED_COOKIES.flatMap((name) => {
    const value = req.cookies.get(name)?.value;
    return value ? [`${name}=${value}`] : [];
  }).join('; ');

// 서버가 내려준 Set-Cookie(참가자 세션 발급·삭제)를 그대로 브라우저로 돌려준다
const withSetCookies = (
  response: NextResponse,
  setCookie: string | string[] | undefined,
) => {
  const values = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [setCookie]
      : [];
  values.forEach((value) => response.headers.append('set-cookie', value));
  return response;
};

// Application 서버가 응답 헤더로 내려주는 CSRF 토큰을 브라우저로 돌려준다
const withCsrfToken = (response: NextResponse, token: unknown) => {
  if (typeof token === 'string') response.headers.set('x-csrf-token', token);
  return response;
};

export async function baseHandleRequest(
  req: NextRequest,
): Promise<NextResponse> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${req.nextUrl.pathname.replace('/api/server', '')}`;
  const method = req.method;
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  let data;
  if (!['GET', 'DELETE', 'HEAD'].includes(method)) {
    try {
      const textBody = await req.text();
      data = textBody ? JSON.parse(textBody) : undefined;
    } catch {
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다.' },
        { status: 400 },
      );
    }
  }

  const cookie = pickForwardedCookies(req);
  const csrfToken = req.headers.get('x-csrf-token');

  try {
    const response = await serverInstance.request({
      url,
      method,
      params,
      data,
      headers: {
        ...(cookie && { Cookie: cookie }),
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      },
    });

    const setCookie = response.headers['set-cookie'];
    if (response.status === 204) {
      return withSetCookies(new NextResponse(null, { status: 204 }), setCookie);
    }

    return withCsrfToken(
      withSetCookies(
        NextResponse.json(response.data, { status: response.status }),
        setCookie,
      ),
      response.headers['x-csrf-token'],
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;
    const message =
      toServerMessage(status, axiosError.response?.data) ||
      '요청을 처리하는 중 오류가 발생했습니다.';

    return withSetCookies(
      NextResponse.json({ error: message, status }, { status }),
      axiosError.response?.headers?.['set-cookie'],
    );
  }
}
