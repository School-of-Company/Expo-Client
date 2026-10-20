import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import { useRealtimeRefetchInterval } from '@/shared/libs/realtime/AdminRealtimeProvider';
import {
  AdminApplicationQuery,
  AdminApplicationRow,
  AdminApplicationSort,
  AdminApplicationStatus,
  AdminOccupation,
  getAdminApplications,
  getAdminApplicationSummary,
  postAdminApplicationCancellation,
  postAdminApplicationPromotion,
  ProgramSessionPolicy,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../api/ledgerApi';
import { getAllCurrentSessions } from '../api/sessionApi';
import { formatDateTime, formatDateWithWeekday } from '../lib/format';

export const LEDGER_PAGE_SIZE = 20;

/** 관리 화면은 접수가 계속 들어오므로 주기적으로 다시 조회한다. 탭이 보이지 않으면 멈춘다 */
export const LEDGER_REFRESH_MS = 30 * 1000;

export const LEDGER_STATUS_LABEL: Record<AdminApplicationStatus, string> = {
  CONFIRMED: '확정',
  WAITING: '대기',
  CANCELLED: '취소',
};

export const LEDGER_STATUS_STYLE: Record<AdminApplicationStatus, string> = {
  CONFIRMED: 'text-main-600',
  WAITING: 'text-black',
  CANCELLED: 'text-gray-300',
};

export const OCCUPATION_LABEL: Record<AdminOccupation, string> = {
  KINDERGARTEN_STUDENT: '미취학',
  ELEMENTARY_STUDENT: '초등학생',
  MIDDLE_SCHOOL_STUDENT: '중학생',
  HIGH_SCHOOL_STUDENT: '고등학생',
  TEACHER: '교원',
  PRE_SERVICE_TEACHER: '예비교사',
  PARENT: '학부모',
  GENERAL: '일반인',
  // 새 신청에서는 고를 수 없지만 예전 답변·필터에 남아 있다
  SCHOOL_STAFF: '교직원',
};

export const PROGRAM_TYPE_LABEL: Record<ProgramSessionType, string> = {
  STANDARD: '일반',
  TRAINING: '연수',
};

/** 화면에 쓰는 원장 행. id 는 UUID 신청 ID */
export interface LedgerRow {
  id: string;
  receiptNumber: number;
  participantId: number;
  traineeId: number | null;
  programType: ProgramSessionType;
  programId: number;
  status: AdminApplicationStatus;
  createdAt: string;
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  name: string;
  phoneNumber: string | null;
  notificationPhoneNumber: string | null;
  occupation: AdminOccupation | null;
  /** 대표자면 true, 동행자면 false */
  isRepresentative: boolean;
  linkedTraineeId: number | null;
}

export const toLedgerRow = (row: AdminApplicationRow): LedgerRow => ({
  id: row.applicationId,
  receiptNumber: row.receiptNumber,
  participantId: row.participantId,
  traineeId: row.traineeId,
  programType: row.programType,
  programId: row.programId,
  status: row.status,
  createdAt: row.createdAt,
  title: row.definition?.title || `회차 ${row.programId}`,
  startedAt: row.definition?.startedAt ?? null,
  endedAt: row.definition?.endedAt ?? null,
  name: row.participant.name,
  phoneNumber: row.participant.phoneNumber,
  notificationPhoneNumber: row.participant.notificationPhoneNumber,
  occupation: row.participant.occupation,
  isRepresentative: row.participant.representativeId === null,
  linkedTraineeId: row.participant.linkedTraineeId,
});

/** 회차 선택 값은 `${programType}:${programId}` */
export const toSessionKey = ({
  programType,
  id,
}: Pick<ProgramSessionDefinition, 'programType' | 'id'>) =>
  `${programType}:${id}`;

export const parseSessionKey = (
  key: string,
): { programType: ProgramSessionType; programId: number } | null => {
  const [programType, id] = key.split(':');
  const programId = Number(id);
  if (
    (programType !== 'STANDARD' && programType !== 'TRAINING') ||
    !Number.isInteger(programId)
  ) {
    return null;
  }
  return { programType, programId };
};

/** 확정과 대기를 함께 보는 상태 필터. 서버에는 쉼표로 보낸다 */
export const ACTIVE_STATUS_FILTER = 'CONFIRMED,WAITING';

export type LedgerStatusFilter =
  | AdminApplicationStatus
  | typeof ACTIVE_STATUS_FILTER
  | '';

/** 상태 필터를 상태 목록으로. 비어 있으면 모든 상태 */
export const toStatusList = (status: LedgerStatusFilter) =>
  status ? (status.split(',') as AdminApplicationStatus[]) : [];

/** 서버 필터와 1:1 로 대응하는 관리대장 필터 */
export interface LedgerFilter {
  session: string;
  status: LedgerStatusFilter;
  /** 제출 당시 회차 시작일(YYYY-MM-DD) */
  eventDate: string;
  /** 제출 당시 제목 */
  search: string;
  /** 참가자 이름·번호 */
  q: string;
  occupation: AdminOccupation | '';
  sort: AdminApplicationSort;
}

export const INITIAL_LEDGER_FILTER: LedgerFilter = {
  session: '',
  status: '',
  eventDate: '',
  search: '',
  q: '',
  occupation: '',
  sort: 'CREATED_DESC',
};

export const Q_MAX_LENGTH = 50;

// Swagger 에 제한이 없어 서버가 400 으로 거절하지 않을 값으로 임의로 둔 상한
export const SEARCH_MAX_LENGTH = 100;

export const toLedgerQuery = (
  filter: LedgerFilter,
  page: number,
): AdminApplicationQuery => {
  const session = parseSessionKey(filter.session);
  const q = filter.q.trim();
  const search = filter.search.trim();
  return {
    ...(session ?? {}),
    status: filter.status || undefined,
    eventDate: filter.eventDate || undefined,
    search: search || undefined,
    q: q || undefined,
    occupation: filter.occupation || undefined,
    sort: filter.sort,
    page,
    size: LEDGER_PAGE_SIZE,
  };
};

export const useLedger = (expoId: string, filter: LedgerFilter, page: number) =>
  useQuery({
    queryKey: ['adminApplications', expoId, filter, page],
    queryFn: () => getAdminApplications(expoId, toLedgerQuery(filter, page)),
    // 페이지·필터를 바꾸는 동안 이전 결과를 유지해 표가 깜빡이지 않게 한다
    placeholderData: keepPreviousData,
    refetchInterval: LEDGER_REFRESH_MS,
    select: (data) => ({ ...data, rows: data.items.map(toLedgerRow) }),
  });

export const useCurrentSessions = (expoId: string) =>
  useQuery({
    queryKey: ['adminCurrentSessions', expoId],
    queryFn: () => getAllCurrentSessions(expoId),
    refetchInterval: LEDGER_REFRESH_MS,
  });

// 회차별 집계는 페이지로 나뉜다. 대시보드는 한 번에 보여 줄 수 있는 최대치를 읽는다
const SUMMARY_SESSION_PAGE_SIZE = 100;

/**
 * 신청 건수·고유 참가자·회차별 집계. filter 를 주면 관리대장과 같은 조건으로 집계하고,
 * 이때는 건수만 쓰므로 회차 집계는 1개만 받는다
 */
export const useLedgerSummary = (expoId: string, filter?: LedgerFilter) =>
  useQuery({
    queryKey: ['adminApplicationSummary', expoId, filter ?? null],
    queryFn: () =>
      getAdminApplicationSummary(expoId, {
        ...(filter ? toLedgerQuery(filter, 0) : {}),
        page: 0,
        size: filter ? 1 : SUMMARY_SESSION_PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    // 회차별 출석 집계도 들어 있어 신청·출석 SSE 가 모두 연결됐을 때만 polling 을 멈춘다
    refetchInterval: useRealtimeRefetchInterval(
      LEDGER_REFRESH_MS,
      'APPLICATIONS',
      'ATTENDANCE',
    ),
    // 실패는 화면의 상태별 문구로 알린다. 서버 원문 전역 토스트는 30초마다 반복되므로 끈다
    meta: { silent: true },
  });

/** 관리자 원장은 참가자 원천(User) 조회가 하나라도 실패하면 전체를 502 로 거절한다 */
export const isParticipantSourceError = (error: unknown) =>
  getErrorStatus(error) === 502;

const LEDGER_ERROR_MESSAGE: Record<number, string> = {
  400: '조회 조건이 올바르지 않습니다. 필터를 확인해주세요.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '이 행사의 접수 원장을 조회할 권한이 없습니다.',
  502: '참가자 정보를 일부 불러오지 못해 목록을 표시하지 않습니다(부분 장애). 잠시 후 다시 시도해주세요.',
};

export const getLedgerErrorMessage = (error: unknown, fallback: string) =>
  LEDGER_ERROR_MESSAGE[getErrorStatus(error) ?? 0] ?? fallback;

/**
 * 집계 조회 실패 문구. 출석·사전등록 원천 장애는 서버가 오류로 주므로
 * 0명으로 바꿔 보여 주지 않고 이 문구만 보인다
 */
export const getSummaryErrorMessage = (error: unknown, fallback: string) => {
  switch (getErrorStatus(error)) {
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '이 행사의 신청 조회 권한(APPLICATION_READ)이 없습니다.';
    case 409:
      return '삭제된 행사라 집계를 볼 수 없습니다.';
    case 502:
      return '집계 원천 응답에 문제가 있어 현황을 표시하지 않습니다. 잠시 후 다시 시도해주세요.';
    case 503:
      return '집계 원천에 연결할 수 없어 현황을 표시하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return fallback;
  }
};

/** 신청 한 건의 최신 상태와 상태 변경 이력 */
export const useApplicationDetail = (expoId: string, applicationId: string) =>
  useQuery({
    queryKey: ['adminApplications', expoId, 'detail', applicationId],
    queryFn: async () => {
      const { items } = await getAdminApplications(expoId, {
        applicationId,
        page: 0,
        size: 1,
      });
      return items[0] ?? null;
    },
  });

/** 서버가 관리자 취소를 받아 주는 상태. 취소된 신청은 다시 취소할 대상이 아니다 */
export const isCancellableStatus = (status: AdminApplicationStatus) =>
  status === 'CONFIRMED' || status === 'WAITING';

/**
 * 관리자 취소 403. 주원인은 Expo 의 행사별 취소 허용 목록에 이 관리자가 없는 경우라
 * 전역 관리자·조회 권한이 있어도 거절된다. 원인과 다음 행동을 함께 알린다
 */
export const CANCEL_FORBIDDEN_MESSAGE =
  '이 행사의 신청 취소 권한이 없습니다. 운영자에게 권한을 요청해주세요.';

/**
 * 관리자 취소 실패 안내. 서버 사유(입장·마감·상태 변경 등)는 프록시를 거치며 공통 문구가 되므로
 * 상태로 나눠 안내한다
 */
const getCancellationErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 403:
      return CANCEL_FORBIDDEN_MESSAGE;
    case 404:
      return '신청을 찾을 수 없습니다. 원장에서 삭제되었거나 다른 행사의 신청입니다.';
    case 409:
      return '지금은 취소할 수 없습니다. 참가자가 이미 입장했거나 취소 기간이 끝났거나 신청 상태가 바뀌었습니다.';
    case 502:
    case 503:
      return '참가자·출석 연동을 확인하지 못해 취소하지 않았습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error instanceof Error
        ? error.message
        : '신청을 취소하지 못했습니다.';
  }
};

/**
 * 관리자 신청 취소. 확정 취소는 대기자 자동 승급으로 다른 신청 상태도 바뀌므로
 * 성공·실패와 상관없이 원장·상세·현황·처리 이력을 다시 읽는다
 */
export const useCancelApplication = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      postAdminApplicationCancellation(expoId, applicationId),
    onSuccess: () => {
      toast.success('신청을 취소했습니다.');
    },
    onError: (error) => {
      toast.error(getCancellationErrorMessage(error));
    },
    onSettled: () =>
      Promise.all(
        [
          // 목록·최근 신청·상세가 모두 이 키 아래에 있다
          ['adminApplications', expoId],
          ['adminApplicationSummary', expoId],
          ['adminCurrentSessions', expoId],
          ['adminChangeHistory', expoId],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};

const timeOf = (dateTime: string) => dateTime.slice(11, 16);

/** 회차 정의 일시 (YYYY-MM-DDTHH:mm) → 10.31(토) 09:30 ~ 12:30. 날짜가 다르면 종료 날짜도 붙인다 */
export const formatDefinitionSchedule = (
  startedAt: string | null,
  endedAt: string | null,
) => {
  if (!startedAt) return '-';
  const date = formatDateWithWeekday(startedAt.slice(0, 10));
  if (!endedAt) return `${date} ${timeOf(startedAt)}`;
  const endDate =
    endedAt.slice(0, 10) === startedAt.slice(0, 10)
      ? ''
      : `${formatDateWithWeekday(endedAt.slice(0, 10))} `;
  return `${date} ${timeOf(startedAt)} ~ ${endDate}${timeOf(endedAt)}`;
};

/** 수동 확정 409 본문의 사유 코드(Application #172). 서버가 모든 조건을 다시 검사하므로 사유만 풀어 안내한다 */
const PROMOTION_CONFLICT_MESSAGE: Record<string, string> = {
  AUTO_PROMOTION_ACTIVE:
    '아직 자동 승급 기간입니다. 자동 승급이 끝난 뒤에 확정할 수 있습니다.',
  PROMOTION_ENDED: '대기 승급 마감이 지나 확정할 수 없습니다.',
  NOT_WAITING: '대기 상태가 아닙니다. 신청 상태가 바뀌었습니다.',
  OFFER_ACTIVE:
    '진행 중인 참여 제안이 있습니다. 제안이 수락·거절·만료된 뒤에 처리해주세요.',
  CAPACITY_CHANGED: '정원이 바뀌어 남은 자리가 없습니다.',
  TIME_CONFLICT: '같은 시간에 확정된 다른 신청이 있어 확정할 수 없습니다.',
  PREREGISTRATION_NOT_CONFIRMED: '사전등록이 확정되지 않아 확정할 수 없습니다.',
  SESSION_TIME_MISMATCH:
    '사전등록한 회차 시간과 맞지 않는 프로그램이라 확정할 수 없습니다.',
  GROUP_ALREADY_APPLIED:
    '같은 묶음의 다른 회차를 이미 신청해 확정할 수 없습니다.',
  TRAINEE_UNAVAILABLE: '연수자 연결을 확인할 수 없어 확정할 수 없습니다.',
};

/** 수동 확정 실패 안내. 실패해도 대기는 그대로 남는다 */
export const getPromotionErrorMessage = (error: unknown) => {
  const code = error instanceof ApiError ? error.code : undefined;
  switch (getErrorStatus(error)) {
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '이 행사의 대기 신청을 확정할 권한(APPLICATION_PROMOTE)이 없습니다.';
    case 404:
      return '신청을 찾을 수 없습니다. 원장에서 삭제되었거나 다른 행사의 신청입니다.';
    case 409:
      return (
        (code && PROMOTION_CONFLICT_MESSAGE[code]) ??
        '지금은 확정할 수 없습니다. 정원·자격·묶음 조건이나 신청 상태가 바뀌었습니다.'
      );
    case 502:
    case 503:
      return '처리가 겹치거나 연동을 확인하지 못해 확정하지 않았습니다. 대기는 그대로입니다. 잠시 후 다시 시도해주세요.';
    default:
      return error instanceof Error
        ? error.message
        : '대기 신청을 확정하지 못했습니다.';
  }
};

/**
 * 관리자 대기 수동 확정. 서버 확정 결과만 반영한다.
 * 성공·실패와 상관없이 원장·상세·현황·잔여석·처리 이력을 다시 읽는다
 */
export const usePromoteApplication = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      postAdminApplicationPromotion(expoId, applicationId),
    onSuccess: () => {
      toast.success('대기 신청을 확정했습니다.');
    },
    onError: (error) => {
      toast.error(getPromotionErrorMessage(error));
    },
    onSettled: () =>
      Promise.all(
        [
          ['adminApplications', expoId],
          ['adminApplicationSummary', expoId],
          ['adminCurrentSessions', expoId],
          ['adminChangeHistory', expoId],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};

/** 서버 목록 size 상한 */
const WAITING_PAGE_SIZE = 100;
/** 순번을 찾으려고 넘겨 볼 최대 페이지. 대기 2,000건까지 */
const WAITING_MAX_PAGES = 20;

/**
 * 대기 목록을 접수 순으로 한 페이지씩 받아 대상의 순번(1부터)을 찾는다. 서버가 순번을 주지 않고 size 가 100까지라
 * 앞 페이지에 없으면 다음 페이지를 받는다. 끝까지 없으면(그 사이 확정·취소됐거나 상한 밖) position 은 null 이다
 */
export const findWaitingPosition = async (
  fetchPage: (
    page: number,
  ) => Promise<{ items: { applicationId: string }[]; totalElements: number }>,
  targetId: string | undefined,
  maxPages = WAITING_MAX_PAGES,
) => {
  const first = await fetchPage(0);
  const indexIn = (items: { applicationId: string }[], page: number) => {
    const index = items.findIndex((item) => item.applicationId === targetId);
    return index >= 0 ? page * WAITING_PAGE_SIZE + index + 1 : null;
  };
  let position = indexIn(first.items, 0);
  const pageCount = Math.min(
    Math.ceil(first.totalElements / WAITING_PAGE_SIZE),
    maxPages,
  );
  for (let page = 1; position === null && page < pageCount; page++) {
    position = indexIn((await fetchPage(page)).items, page);
  }
  return { position, total: first.totalElements };
};

/** 대기 신청이 속한 회차의 현재 정책과 대기 순서. 순서는 접수 순이며 처리 가능 여부는 서버가 정한다 */
export const useWaitlistContext = (
  expoId: string,
  target: Pick<LedgerRow, 'id' | 'programType' | 'programId'> | null,
) =>
  useQuery({
    queryKey: [
      'adminApplications',
      expoId,
      'waitlist',
      target?.programType,
      target?.programId,
      target?.id,
    ],
    enabled: target !== null,
    queryFn: async () => {
      const query = {
        programType: target?.programType,
        programId: target?.programId,
      };
      const [waiting, sessions] = await Promise.all([
        findWaitingPosition(
          (page) =>
            getAdminApplications(expoId, {
              ...query,
              status: 'WAITING',
              sort: 'CREATED_ASC',
              page,
              size: WAITING_PAGE_SIZE,
            }),
          target?.id,
        ),
        getAllCurrentSessions(expoId, query),
      ]);
      return { ...waiting, policy: sessions[0]?.policy ?? null };
    },
    meta: { silent: true },
  });

/** 자동 승급이 멈춘 뒤 최종 마감 전까지의 수동 확정 구간 안내. 판단은 서버가 하므로 화면 문구에만 쓴다 */
export const getPromotionWindowLabel = (
  policy: ProgramSessionPolicy | null,
): string | null => {
  if (!policy) return null;
  if (policy.autoPromotionEnabled === false)
    return '자동 승급 꺼짐 (수동 확정)';
  if (policy.autoPromotionEndedAt)
    return `자동 승급 ${formatDateTime(policy.autoPromotionEndedAt)}까지`;
  return '자동 승급 (대기 승급 마감까지)';
};
