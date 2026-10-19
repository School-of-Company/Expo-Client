import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { AdminOccupation } from '../api/ledgerApi';
import {
  AdminPreregisterQuery,
  AdminPreregisterRow,
  AdminPreregisterStatus,
  getAdminPreregistration,
  getAdminPreregistrations,
  getAdminPreregistrationTargets,
  postAdminPreregistrationCancellation,
} from '../api/preregisterLedgerApi';
import {
  CANCEL_FORBIDDEN_MESSAGE,
  LEDGER_PAGE_SIZE,
  LEDGER_REFRESH_MS,
} from './ledger';
import { preregisterSummaryQueryKey } from './preregisterSummary';
import { scheduleQueryKeys } from './useSchedule';

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
  /** 참가자 행의 로컬 대표자 ID. 같은 일행을 묶는 데 쓴다 */
  representativeId: number | null;
  cancelledAt: string | null;
  /** 취소 행의 처리자 표시. 취소가 아니면 null */
  cancellationActor: string | null;
}

/** 주체가 기록되지 않은 과거 취소(UNKNOWN)는 사용자·자동으로 단정하지 않는다 */
const getCancellationActorLabel = ({
  status,
  cancellationActorType,
  cancellationActorId,
  cancellationActorUser,
}: AdminPreregisterRow): string | null => {
  if (status !== 'CANCELLED') return null;
  switch (cancellationActorType) {
    case 'ADMIN':
      return cancellationActorId
        ? `관리자 (ID ${cancellationActorId})`
        : '관리자';
    case 'USER':
      return cancellationActorUser?.name
        ? `참가자 (${cancellationActorUser.name})`
        : '참가자';
    case 'SYSTEM':
      return '자동 처리';
    default:
      return '미기록';
  }
};

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
  representativeId: row.representativeId,
  cancelledAt: row.cancelledAt ?? null,
  cancellationActor: getCancellationActorLabel(row),
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

/** 관리자가 취소·철회할 수 있는 행. 처리중(PENDING)·취소 행은 대상이 아니다 */
export const isPreregisterCancellable = (row: PreregisterRow) =>
  row.status === 'CONFIRMED' || row.status === 'WAITING';

/**
 * 대표자 확정 행의 같은 일행(대표자 포함). 동행자가 남아 있으면 대표자만 취소할 수 없어
 * 일행 전체를 한 요청으로 보낸다. 동행자는 대표자 이름으로 검색되지 않아 회차 확정 행에서 고른다
 */
export const usePreregisterParty = (
  expoId: string,
  row: PreregisterRow,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [
      'adminPreregistrations',
      expoId,
      'party',
      row.sessionId,
      row.representativeId,
    ],
    queryFn: async () => {
      const items = await getAdminPreregistrationTargets(expoId, {
        sessionId: row.sessionId,
        status: ['CONFIRMED'],
      });
      return items
        .map(toPreregisterRow)
        .filter((item) => item.representativeId === row.representativeId)
        .sort((a, b) =>
          a.relation === b.relation
            ? 0
            : a.relation === 'REPRESENTATIVE'
              ? -1
              : 1,
        );
    },
    enabled:
      enabled &&
      row.relation === 'REPRESENTATIVE' &&
      row.status === 'CONFIRMED',
    meta: { silent: true },
  });

const CANCEL_ERROR_MESSAGE: Record<number, string> = {
  400: '한 번에 한 일행만 취소할 수 있습니다. 목록을 새로고침한 뒤 다시 시도해주세요.',
  404: '사전등록 신청을 찾을 수 없습니다. 상태가 바뀌었거나 다른 행사의 신청입니다.',
  409: '지금은 취소할 수 없습니다. 이미 입장했거나 취소 기간이 끝났거나, 동행자가 남아 있거나 상태가 바뀌었습니다.',
  502: '참가자·출석 연동을 확인하지 못해 취소하지 않았습니다. 잠시 후 다시 시도해주세요.',
  503: '참가자·출석 연동을 확인하지 못해 취소하지 않았습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * 서버가 준 한국어 사유를 먼저 보여 주고, 없으면 상태별 안내를 쓴다.
 * 403 은 프록시가 공통 문구("이 작업을 할 권한이 없습니다.")로 바꿔 보내므로 취소 권한 안내로 대신한다
 */
const getCancelErrorMessage = (error: unknown) =>
  (getErrorStatus(error) === 403 && CANCEL_FORBIDDEN_MESSAGE) ||
  (error instanceof Error && error.message) ||
  CANCEL_ERROR_MESSAGE[getErrorStatus(error) ?? 0] ||
  '사전등록을 취소하지 못했습니다.';

/**
 * 관리자 사전등록 취소·대기 철회. 확정 취소는 대기 승급으로 다른 행도 바뀌므로
 * 성공·실패와 상관없이 목록·상세·집계·회차 현황을 다시 읽는다
 */
export const useCancelPreregistration = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ keys }: { keys: string[]; isWithdrawal: boolean }) =>
      postAdminPreregistrationCancellation(expoId, keys),
    onSuccess: (_, { isWithdrawal }) => {
      toast.success(
        isWithdrawal ? '대기 신청을 철회했습니다.' : '사전등록을 취소했습니다.',
      );
    },
    onError: (error) => {
      toast.error(getCancelErrorMessage(error));
    },
    onSettled: () =>
      Promise.all(
        [
          // 목록·상세·일행이 모두 이 키 아래에 있다
          ['adminPreregistrations', expoId],
          preregisterSummaryQueryKey(expoId),
          scheduleQueryKeys.sessions(expoId),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};
