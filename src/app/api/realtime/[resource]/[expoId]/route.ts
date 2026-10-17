import { NextRequest, NextResponse } from 'next/server';
import { forbiddenPathResponse } from '@/shared/libs/handler/proxyTarget';
import { streamHandleRequest } from '@/shared/libs/handler/streamHandler';
import { toUpstreamStreamPath } from '@/shared/libs/realtime/contract';

// 연결마다 열리는 스트림이라 캐시·정적 생성을 하지 않는다. 토큰 재발급이 Redis 를 써서 Node 런타임이다
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Vercel 함수 실행 시간 제한에 연결이 끊긴다. 끊기면 클라이언트가 다시 붙고 GET 으로 다시 맞춘다
export const maxDuration = 300;

/** 관리자 대시보드·입퇴장 모니터링의 갱신 신호(SSE). 정해 둔 리소스 경로만 Gateway 로 넘긴다 */
export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string; expoId: string } },
): Promise<NextResponse> {
  const upstreamPath = toUpstreamStreamPath(params.resource, params.expoId);
  if (!upstreamPath) return forbiddenPathResponse();
  return streamHandleRequest(req, upstreamPath);
}
