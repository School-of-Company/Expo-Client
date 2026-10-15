import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { maskPhoneNumber } from '../../common';
import { Q_MAX_LENGTH } from '../../common/model/ledger';
import {
  getAdminParticipantQr,
  getAdminParticipants,
} from '../api/participantSearchApi';

export const PARTICIPANT_PAGE_SIZE = 20;

/** 화면 입력을 서버 q 로 바꾼다. 비어 있으면 undefined(조회 안 함), 길이 초과는 잘라 보낸다 */
export const toParticipantQuery = (input: string) =>
  input.trim().slice(0, Q_MAX_LENGTH) || undefined;

/** 형식을 모르는 번호도 뒤 4자리만 남긴다 */
export const maskParticipantPhone = (phone: string | null) => {
  if (!phone) return '-';
  const masked = maskPhoneNumber(phone);
  return masked === phone ? `****${phone.slice(-4)}` : masked;
};

/** 커서(participantId)로 이어 붙이는 참가자 검색. 서버가 q 없는 요청을 400 으로 거절하므로 q 가 있을 때만 조회한다. 전화번호가 담기므로 캐시는 화면을 떠나면 바로 버린다 */
export const useAdminParticipants = (expoId: string, q?: string) =>
  useInfiniteQuery({
    queryKey: ['adminParticipants', expoId, q],
    enabled: !!q,
    queryFn: ({ pageParam }) =>
      getAdminParticipants(expoId, {
        q,
        cursor: pageParam,
        size: PARTICIPANT_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: ({ nextCursor }) => nextCursor ?? undefined,
    select: ({ pages }) => pages.flatMap(({ items }) => items),
    gcTime: 0,
  });

/** QR code 는 캐시에 남기지 않는다 */
export const useAdminParticipantQr = (expoId: string, participantId: number) =>
  useQuery({
    queryKey: ['adminParticipantQr', expoId, participantId],
    queryFn: () => getAdminParticipantQr(expoId, participantId),
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });

export const getParticipantsErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return '검색어 또는 박람회 정보가 올바르지 않습니다.';
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '참가자를 조회할 권한이 없습니다.';
    case 502:
    case 503:
      return '지금은 참가자를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '참가자를 불러오지 못했습니다.';
  }
};

export const getParticipantQrErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '입장 QR 을 조회할 권한이 없습니다.';
    case 502:
    case 503:
      return '지금은 입장 QR 을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.';
    // 사전등록 미확정·취소·입장 불가는 서버가 구분해 주지 않는다
    case 400:
    case 404:
      return '입장 QR 을 발급할 수 없는 참가자입니다. (사전등록 미확정 또는 취소)';
    default:
      return '입장 QR 을 불러오지 못했습니다.';
  }
};
