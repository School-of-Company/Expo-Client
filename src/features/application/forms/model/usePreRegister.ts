'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getPreRegisterCapacity,
  getPublicPreregisterSessions,
  PublicPreregisterSession,
} from '../api/preRegister';

/**
 * 회차 잔여석(안내용). 조회에 실패하면 잔여석을 알 수 없으므로 화면이 알리고 신청을 막는다.
 * 조회 실패를 삼킨 채 신청을 진행시키면 정원이 찬 회차에 신청해 일행 전체가 거절된다.
 */
export const usePreRegisterCapacity = (expoId: string, sessionId: string) =>
  useQuery({
    queryKey: ['preRegisterCapacity', expoId, sessionId],
    queryFn: () => getPreRegisterCapacity(expoId, sessionId),
    retry: false,
    // 회차 없이 들어온 링크는 화면이 회차 선택을 안내하므로 조회하지 않는다
    enabled: !!sessionId,
  });

/** 참가자용 사전등록 회차 목록. 시작 시각 순으로 온다 */
export const usePreRegisterSessions = (expoId: string) =>
  useQuery({
    queryKey: ['preRegisterSessions', expoId],
    queryFn: () => getPublicPreregisterSessions(expoId),
    retry: false,
    // 실패한 조회는 화면이 다시 그려질 때마다 다시 보내지 않고 "다시 불러오기"로만 다시 받는다
    retryOnMount: false,
    // 실패는 회차 선택 화면이 직접 안내한다
    meta: { silent: true },
  });

export type PreRegisterSessionState = 'OPEN' | 'CLOSED' | 'ENDED';

export const PRE_REGISTER_SESSION_STATE_LABEL: Record<
  PreRegisterSessionState,
  string
> = {
  OPEN: '신청 가능',
  CLOSED: '접수 마감',
  ENDED: '종료',
};

/** 화면 안내용 상태. 정원·접수 기간의 최종 판정은 신청할 때 서버가 한다 */
export const getPreRegisterSessionState = (
  session: PublicPreregisterSession,
  now: Date = new Date(),
): PreRegisterSessionState => {
  if (session.closed) return 'CLOSED';
  const end = new Date(session.endedAt).getTime();
  return !Number.isNaN(end) && end < now.getTime() ? 'ENDED' : 'OPEN';
};

/** 교사 구분 신청자에게 보이는 회차 안내. 숫자 없이 신청 가능/마감만 말한다 */
export const getTeacherSeatNotice = (targetSeats: {
  teacherAvailable: boolean;
}) => (targetSeats.teacherAvailable ? '신청 가능' : '마감');

/** 내 신청·완료 화면용 교사 잔여석. 공개 capacity 와 같은 응답이라 같은 캐시 키를 쓰고 신청·취소 뒤 함께 갱신된다 */
export const useOwnTeacherSeats = (expoId: string, sessionId: string) =>
  usePreRegisterCapacity(expoId, sessionId);
