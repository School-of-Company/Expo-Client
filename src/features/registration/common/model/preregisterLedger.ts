import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminPreregisterQuery,
  AdminPreregisterReservation,
  getAdminPreregistration,
  getAdminPreregistrations,
  postAdminPreregistrationCancellation,
  PreregisterSort,
  PreregisterTargetFilter,
} from '../api/preregisterLedgerApi';
import { LEDGER_PAGE_SIZE, LEDGER_REFRESH_MS, toStatusList } from './ledger';
import { preregisterSummaryQueryKey } from './preregisterSummary';
import type { LedgerStatusFilter } from './ledger';

export interface PreregisterFilter {
  /** 회차 ID. 전체는 빈 문자열 */
  session: string;
  status: LedgerStatusFilter;
  /** 대표자·동행자 이름·번호 */
  q: string;
  sort: PreregisterSort;
}

export const INITIAL_PREREGISTER_FILTER: PreregisterFilter = {
  session: '',
  status: '',
  q: '',
  sort: 'CREATED_DESC',
};

/** 화면 행. id 는 예약/일행 ID 이고 참가자 ID 가 아니다 */
export interface PreregisterRow extends AdminPreregisterReservation {
  id: string;
}

export const toPreregisterRow = (
  reservation: AdminPreregisterReservation,
): PreregisterRow => ({ ...reservation, id: reservation.reservationId });

const toSessionId = (session: string) => {
  const id = Number(session);
  return session !== '' && Number.isInteger(id) ? id : undefined;
};

export const toPreregisterQuery = (
  filter: PreregisterFilter,
  page: number,
): AdminPreregisterQuery => ({
  q: filter.q.trim() || undefined,
  sessionId: toSessionId(filter.session),
  status: filter.status || undefined,
  sort: filter.sort,
  page,
  size: LEDGER_PAGE_SIZE,
});

/** 엑셀·메시지에 보내는 대상 필터. 현재 탭의 조건만 담는다 */
export const toPreregisterTargetFilter = (
  filter: PreregisterFilter,
): PreregisterTargetFilter => {
  const q = filter.q.trim();
  const status = toStatusList(filter.status);
  return {
    ...(q && { q }),
    ...(toSessionId(filter.session) !== undefined && {
      sessionId: toSessionId(filter.session),
    }),
    ...(status.length > 0 && { status }),
    sort: filter.sort,
  };
};

/** 적용 중인 검색 조건을 사람이 읽는 문구로. 없으면 빈 배열 */
export const describePreregisterFilter = (
  filter: PreregisterFilter,
  sessionLabel: (sessionId: string) => string,
  statusLabel: Record<string, string>,
) => {
  const parts: string[] = [];
  if (filter.q.trim()) parts.push(`검색 "${filter.q.trim()}"`);
  if (filter.session) parts.push(sessionLabel(filter.session));
  if (filter.status) {
    parts.push(
      toStatusList(filter.status)
        .map((status) => statusLabel[status])
        .join('+'),
    );
  }
  return parts;
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

export const usePreregisterDetail = (expoId: string, reservationId: string) =>
  useQuery({
    queryKey: ['adminPreregistrations', expoId, 'detail', reservationId],
    queryFn: () => getAdminPreregistration(expoId, reservationId),
  });

const ERROR_MESSAGE: Record<number, string> = {
  400: '조회 조건이 올바르지 않습니다. 필터를 확인해주세요.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '이 행사의 사전등록을 조회할 권한이 없습니다.',
  404: '사전등록 신청을 찾을 수 없습니다. 삭제되었거나 다른 행사의 신청입니다.',
  409: '삭제된 행사라 사전등록을 볼 수 없습니다.',
  502: '참가자 정보를 불러오지 못해 목록을 표시하지 않습니다. 잠시 후 다시 시도해주세요.',
  503: '연동 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

export const getPreregisterErrorMessage = (error: unknown, fallback: string) =>
  ERROR_MESSAGE[getErrorStatus(error) ?? 0] ?? fallback;

/** 취소 가능한 상태. 대기 일행도 취소할 수 있다 */
export const isCancellablePreregister = (status: string) =>
  status === 'CONFIRMED' || status === 'WAITING';

const getCancellationErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 403:
      return '이 행사의 사전등록을 취소할 권한이 없습니다.';
    case 404:
      return '신청을 찾을 수 없습니다. 삭제되었거나 다른 행사의 신청입니다.';
    case 409:
      return '지금은 취소할 수 없습니다. 이미 입장했거나 취소 기간이 끝났거나 상태가 바뀌었습니다.';
    case 502:
    case 503:
      return '참가자·출석 연동을 확인하지 못해 취소하지 않았습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error instanceof Error
        ? error.message
        : '사전등록 신청을 취소하지 못했습니다.';
  }
};

/** 확정 취소는 대기 일행 자동 승급으로 다른 신청도 바뀌므로 성공·실패와 상관없이 목록·상세·집계를 다시 읽는다 */
export const useCancelPreregistration = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      postAdminPreregistrationCancellation(expoId, reservationId),
    onSuccess: () => {
      toast.success('사전등록 신청을 취소했습니다.');
    },
    onError: (error) => {
      toast.error(getCancellationErrorMessage(error));
    },
    onSettled: () =>
      Promise.all(
        [
          ['adminPreregistrations', expoId],
          preregisterSummaryQueryKey(expoId),
          ['adminChangeHistory', expoId],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};
