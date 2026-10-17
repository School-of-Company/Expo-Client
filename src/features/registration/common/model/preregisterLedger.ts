import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { AdminOccupation } from '../api/ledgerApi';
import {
  AdminPreregisterQuery,
  AdminPreregisterRow,
  AdminPreregisterStatus,
  getAdminPreregistration,
  getAdminPreregistrations,
} from '../api/preregisterLedgerApi';
import { LEDGER_PAGE_SIZE, LEDGER_REFRESH_MS } from './ledger';

export const PREREGISTER_STATUS_LABEL: Record<AdminPreregisterStatus, string> =
  {
    CONFIRMED: '확정',
    WAITING: '대기',
    PENDING: '확정 처리중',
    CANCELLED: '취소',
  };

/** 상태 필터 값. 서버에는 쉼표로 보낸다 */
export const PREREGISTER_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: '전체 상태' },
  { value: 'CONFIRMED,WAITING,PENDING', label: '유효 접수(확정+대기+처리중)' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'WAITING', label: '대기' },
  { value: 'PENDING', label: '확정 처리중' },
  { value: 'CANCELLED', label: '취소' },
];

export interface PreregisterFilter {
  /** 회차 ID. 전체는 빈 문자열 */
  session: string;
  status: string;
  /** 대표자·참가자 이름·번호 */
  q: string;
}

export const INITIAL_PREREGISTER_FILTER: PreregisterFilter = {
  session: '',
  status: '',
  q: '',
};

export type PreregisterRelation = 'REPRESENTATIVE' | 'COMPANION' | 'PARTY';

/** 화면 행. id 는 서버 행 key 이며 참가자 ID 가 아니다 */
export interface PreregisterRow {
  id: string;
  sessionId: number;
  status: AdminPreregisterStatus;
  /** 대표자 / 동행자(참가자 행) / 일행(예약 행) */
  relation: PreregisterRelation;
  applicants: number;
  name: string | null;
  phoneNumber: string | null;
  occupation: AdminOccupation | null;
  createdAt: string | null;
  /** 대기·처리중·철회된 예약이면 true. User 저장 전이라 참가자 ID 와 QR 이 없다 */
  isReservation: boolean;
}

/** 참가자 행은 로컬 대표자 ID 와 참가자 ID 가 같으면 대표자, 다르면 그 대표자의 동행자다 */
const toRelation = (row: AdminPreregisterRow): PreregisterRelation => {
  if (row.participantId === null) return 'PARTY';
  return row.participantId === row.representativeId
    ? 'REPRESENTATIVE'
    : 'COMPANION';
};

export const toPreregisterRow = (row: AdminPreregisterRow): PreregisterRow => ({
  id: row.key,
  sessionId: row.sessionId,
  status: row.status,
  relation: toRelation(row),
  applicants: row.applicants,
  name: row.participant?.name ?? row.reservation?.name ?? null,
  phoneNumber:
    row.participant?.phoneNumber ?? row.reservation?.phoneNumber ?? null,
  occupation:
    row.participant?.occupation ?? row.reservation?.occupation ?? null,
  createdAt: row.createdAt,
  isReservation: row.participantId === null,
});

export const toPreregisterQuery = (
  filter: PreregisterFilter,
  page: number,
): AdminPreregisterQuery => {
  const sessionId = Number(filter.session);
  return {
    q: filter.q.trim() || undefined,
    sessionId:
      filter.session !== '' && Number.isInteger(sessionId)
        ? sessionId
        : undefined,
    status: filter.status || undefined,
    page,
    size: LEDGER_PAGE_SIZE,
  };
};

export const usePreregisterLedger = (
  expoId: string,
  filter: PreregisterFilter,
  page: number,
) =>
  useQuery({
    queryKey: ['adminPreregistrations', expoId, 'list', filter, page],
    queryFn: () =>
      getAdminPreregistrations(expoId, toPreregisterQuery(filter, page)),
    placeholderData: keepPreviousData,
    refetchInterval: LEDGER_REFRESH_MS,
    select: (data) => ({ ...data, rows: data.items.map(toPreregisterRow) }),
  });

export const usePreregisterDetail = (expoId: string, key: string) =>
  useQuery({
    queryKey: ['adminPreregistrations', expoId, 'detail', key],
    queryFn: () => getAdminPreregistration(expoId, key),
  });

const ERROR_MESSAGE: Record<number, string> = {
  400: '조회 조건이 올바르지 않습니다. 필터를 확인해주세요.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '이 행사의 사전등록을 조회할 권한이 없습니다.',
  404: '사전등록 신청을 찾을 수 없습니다. 상태가 바뀌어 사라졌거나 다른 행사의 신청입니다. 목록을 새로고침해주세요.',
  502: '참가자 정보를 일부 불러오지 못해 목록을 표시하지 않습니다(부분 장애). 잠시 후 다시 시도해주세요.',
};

export const getPreregisterErrorMessage = (error: unknown, fallback: string) =>
  ERROR_MESSAGE[getErrorStatus(error) ?? 0] ?? fallback;
