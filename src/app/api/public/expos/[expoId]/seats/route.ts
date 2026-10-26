import axios from 'axios';
import { NextResponse } from 'next/server';
import { time } from '@/features/application/forms/model/applicationSchedule';
import {
  LiveSeats,
  PreRegisterCapacityWire,
  ProgramSeatsWire,
  SeatGroup,
  fromPreRegisterCapacity,
  fromProgramSeats,
  isCacheable,
} from '@/features/application/forms/model/liveSeats';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import type { ProgramType } from '@/shared/types/program/list/type';

// 요청마다 Gateway 를 조회하고 캐시는 아래 Cache-Control 로 CDN 이 맡는다
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 경로 주입을 막기 위해 UUID 만 받는다
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 5초마다 한 번만 조회하고, 그 뒤 30초까지는 오래된 값을 주면서 새로 받아 둔다
const CACHE_CONTROL = 'public, s-maxage=5, stale-while-revalidate=30';

interface PublicSession {
  id: number;
  closed: boolean;
  endedAt: string;
}

// 쿠키를 싣지 않는 조회다. 공개 경로만 쓰므로 토큰이 없어도 Gateway 가 받는다
const get = async <T>(path: string) => (await serverInstance.get<T>(path)).data;

const getPreRegister = async (expoId: string): Promise<SeatGroup> => {
  try {
    const list = await get<PublicSession[]>(
      `/expo/${expoId}/preregister-sessions/public`,
    );
    const now = Date.now();
    const sessions = await Promise.all(
      list.map(async ({ id, closed, endedAt }) => {
        const ended = closed || time(endedAt) < now;
        // 닫힌 회차는 숫자를 보이지 않으므로 정원 조회(DB lock)를 하지 않는다
        if (ended) return { id, closed: true, seats: null };
        try {
          const capacity = await get<PreRegisterCapacityWire>(
            `/application/expos/${expoId}/preregister-sessions/${id}/capacity`,
          );
          return {
            id,
            closed: false,
            seats: fromPreRegisterCapacity(capacity, closed),
          };
        } catch {
          return { id, closed: false, seats: null };
        }
      }),
    );
    return { status: 'ok', sessions };
  } catch {
    return { status: 'error', sessions: [] };
  }
};

const getPrograms = async (
  expoId: string,
  programType: ProgramType,
): Promise<SeatGroup> => {
  try {
    const { sessions } = await get<{ sessions: ProgramSeatsWire[] }>(
      `/application/expos/${expoId}/program-sessions/${programType}/seats`,
    );
    return { status: 'ok', sessions: sessions.map(fromProgramSeats) };
  } catch (error) {
    // 공개 정원 요약 API 가 아직 배포·공개되지 않았으면(404·401·403) 사전등록 회차만 돌려준다
    const status = axios.isAxiosError(error) && error.response?.status;
    return {
      status:
        status && [401, 403, 404].includes(status) ? 'unsupported' : 'error',
      sessions: [],
    };
  }
};

/** 사전등록 회차·프로그램·연수 목록 카드가 함께 쓰는 공개 정원 현황. 로그인 없이 박람회 단위로 모아 돌려준다 */
export async function GET(
  _req: Request,
  { params }: { params: { expoId: string } },
) {
  const { expoId } = params;
  if (!UUID.test(expoId))
    return NextResponse.json(
      { error: '잘못된 박람회 ID 입니다.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );

  const [preRegister, standard, training] = await Promise.all([
    getPreRegister(expoId),
    getPrograms(expoId, 'STANDARD'),
    getPrograms(expoId, 'TRAINING'),
  ]);
  const body: LiveSeats = {
    fetchedAt: new Date().toISOString(),
    preRegister,
    programs: { STANDARD: standard, TRAINING: training },
  };
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': isCacheable(body) ? CACHE_CONTROL : 'no-store',
    },
  });
}
