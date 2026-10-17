import { NextRequest, NextResponse } from 'next/server';
import { forbiddenPathResponse } from '@/shared/libs/handler/proxyTarget';
import { streamHandleRequest } from '@/shared/libs/handler/streamHandler';
import { toUpstreamStreamPath } from '@/shared/libs/realtime/contract';

// 연결마다 열리는 스트림이라 캐시·정적 생성을 하지 않는다. 토큰 재발급이 Redis 를 써서 Node 런타임이다
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 관리자 대시보드·입퇴장 모니터링의 갱신 신호(SSE). 정해 둔 리소스 경로만 Gateway 로 넘긴다 */
export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string; expoId: string } },
): Promise<NextResponse> {
  const upstreamPath = toUpstreamStreamPath(params.resource, params.expoId);
  if (!upstreamPath) return forbiddenPathResponse();
  return streamHandleRequest(req, upstreamPath);
}
