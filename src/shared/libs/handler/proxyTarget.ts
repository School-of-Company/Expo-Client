import { NextRequest, NextResponse } from 'next/server';
import { GATEWAY_URL } from '@/shared/libs/http/serverInstance';

// Gateway 가 공개하는 경로의 첫 세그먼트(Swagger 7개 서비스 기준). 이 밖의 경로는 프록시가 넘기지 않는다
const ALLOWED_ROOTS = new Set([
  'admin',
  'application',
  'attendance',
  'auth',
  'excel',
  'expo',
  'forms',
  'image',
  'participant',
  'participant-auth',
  'qr-tokens',
  'sms',
  'standard',
  'surveys',
  'trainee',
  'training',
]);

// 인코딩된 구분자(%2F, %5C)와 점(%2E)은 Gateway 가 풀어 경로를 바꿀 수 있어 받지 않는다
const ENCODED_SEPARATOR = /%2f|%5c|%2e/i;

/**
 * 프록시 경로(`/api/server/...`)를 Gateway 주소로 바꾼다. 허용하지 않는 경로면 null.
 * 서비스 간 호출용 `/internal/**` 처럼 브라우저가 부르면 안 되는 경로로 관리자 토큰을 싣지 않기 위해서다.
 * 쿼리는 원문 그대로 붙여 같은 키가 여러 번 오는 경우(`?ids=1&ids=2`)도 보존한다
 */
export const toGatewayUrl = (
  req: NextRequest,
  prefix: string,
): string | null => {
  const path = req.nextUrl.pathname.slice(prefix.length);
  if (ENCODED_SEPARATOR.test(path) || path.includes('\\')) return null;

  const segments = path.split('/').filter(Boolean);
  if (!ALLOWED_ROOTS.has(segments[0] ?? '')) return null;
  if (
    segments.some(
      (segment) =>
        segment === '.' ||
        segment === '..' ||
        segment.toLowerCase() === 'internal',
    )
  ) {
    return null;
  }

  return `${GATEWAY_URL}${path}${req.nextUrl.search}`;
};

export const forbiddenPathResponse = () =>
  NextResponse.json(
    { error: '지원하지 않는 요청 경로입니다.', status: 404 },
    { status: 404 },
  );

// 엑셀처럼 바이너리로 받아야 하는 요청
export const isFileDownloadRequest = (req: NextRequest) =>
  req.headers.get('X-File-Download') === 'true' ||
  req.nextUrl.pathname.includes('/excel/');
