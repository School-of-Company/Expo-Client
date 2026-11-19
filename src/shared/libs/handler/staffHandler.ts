import { NextRequest, NextResponse } from 'next/server';
import { handleError } from './error';
import { forbiddenPathResponse, toGatewayUrl } from './proxyTarget';
import { parseRequestData, sendRequest } from './request';
import { createResponse } from './response';

const STAFF_PREFIX = '/api/server/staff';

// 스태프 토큰은 입장·퇴장·간편입장·프로그램 출석만 한다. 그 밖의 경로로는 토큰을 싣지 않는다
const STAFF_ROOTS = new Set(['attendance', 'walk-in-counts']);

const BEARER = /^Bearer ([A-Za-z0-9._~+/=-]+)$/;

/**
 * 스태프 링크 화면의 요청을 Gateway 로 넘긴다. 관리자 쿠키는 쓰지 않고,
 * 화면이 메모리에 들고 있는 스태프 토큰(Authorization)만 싣는다. 토큰 갱신은 화면이 링크 비밀값으로 다시 받는다
 */
export async function staffHandleRequest(
  req: NextRequest,
): Promise<NextResponse> {
  const url = toGatewayUrl(req, STAFF_PREFIX);
  const root = req.nextUrl.pathname
    .slice(STAFF_PREFIX.length)
    .split('/')
    .filter(Boolean)[0];
  if (!url || !STAFF_ROOTS.has(root ?? '')) return forbiddenPathResponse();

  const token = req.headers.get('authorization')?.match(BEARER)?.[1];
  if (!token) {
    return NextResponse.json(
      { error: '스태프 인증이 필요합니다.', status: 401 },
      { status: 401 },
    );
  }

  let parsed: Awaited<ReturnType<typeof parseRequestData>>;
  try {
    parsed = await parseRequestData(req);
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 본문입니다.', status: 400 },
      { status: 400 },
    );
  }

  try {
    const response = await sendRequest(
      req,
      url,
      token,
      parsed.requestData,
      parsed.headers,
    );
    return createResponse(response, false);
  } catch (error) {
    return handleError(error);
  }
}
