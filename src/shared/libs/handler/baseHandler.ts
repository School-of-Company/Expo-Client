import { AxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { toUpstreamFailure } from './error';
import { forbiddenPathResponse, toGatewayUrl } from './proxyTarget';
import { toServerMessage } from './serverMessage';

// 참가자 화면이 쓰는 서버 세션 쿠키만 서버로 넘긴다. 관리자 로그인 토큰 쿠키는 공개 요청에 싣지 않는다.
// JSESSIONID 는 참가자 신청 취소의 CSRF 토큰이 묶인 세션이다
const FORWARDED_COOKIES = ['PARTICIPANT_SESSION', 'XSRF-TOKEN', 'JSESSIONID'];

// 그 밖의 브라우저 헤더는 넘기지 않는다.
// Idempotency-Key: 신청 중복 등록 방지. X-XSRF-TOKEN·X-CSRF-TOKEN: 참가자 세션 경로의 CSRF 검증(쿠키가 아니라 헤더로 본다)
const FORWARDED_HEADERS = ['Idempotency-Key', 'X-XSRF-TOKEN', 'X-CSRF-TOKEN'];

// 내 신청 조회가 응답 헤더로 주는 CSRF 토큰. 브라우저가 취소 요청에 실어 보내도록 돌려준다
const RETURNED_HEADERS = ['x-csrf-token'];

const pickForwardedHeaders = (req: NextRequest) => {
  const headers: Record<string, string> = {};
  FORWARDED_HEADERS.forEach((name) => {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  });
  const cookie = pickForwardedCookies(req);
  if (cookie) headers.Cookie = cookie;
  return headers;
};

const pickForwardedCookies = (req: NextRequest) =>
  FORWARDED_COOKIES.flatMap((name) => {
    const value = req.cookies.get(name)?.value;
    return value ? [`${name}=${value}`] : [];
  }).join('; ');

const withReturnedHeaders = (
  response: NextResponse,
  headers: Record<string, unknown>,
) => {
  RETURNED_HEADERS.forEach((name) => {
    const value = headers[name];
    if (typeof value === 'string' && value) response.headers.set(name, value);
  });
  return response;
};

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

export async function baseHandleRequest(
  req: NextRequest,
): Promise<NextResponse> {
  const url = toGatewayUrl(req, '/api/server');
  if (!url) return forbiddenPathResponse();
  const method = req.method;

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

  try {
    const response = await serverInstance.request({
      url,
      method,
      data,
      headers: pickForwardedHeaders(req),
    });

    const setCookie = response.headers['set-cookie'];
    const body =
      response.status === 204
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json(response.data, { status: response.status });

    return withSetCookies(
      withReturnedHeaders(body, response.headers),
      setCookie,
    );
  } catch (error) {
    const upstream = toUpstreamFailure(error);
    if (upstream) {
      return NextResponse.json(
        { error: upstream.message, status: upstream.status },
        { status: upstream.status },
      );
    }

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
