import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminApplicationQuery,
  AdminApplicationRow,
  AdminApplicationSort,
  AdminApplicationStatus,
  AdminOccupation,
  getAdminApplications,
  getAdminApplicationSummary,
  postAdminApplicationCancellation,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../api/ledgerApi';
import { getAllCurrentSessions } from '../api/sessionApi';
import { formatDateWithWeekday } from '../lib/format';

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
  KINDERGARTEN_STUDENT: '유치원생',
  ELEMENTARY_STUDENT: '초등학생',
  MIDDLE_SCHOOL_STUDENT: '중학생',
  HIGH_SCHOOL_STUDENT: '고등학생',
  SCHOOL_STAFF: '교직원',
  PARENT: '보호자/학부모',
  GENERAL: '일반인',
  TEACHER: '교사',
  PRE_SERVICE_TEACHER: '예비교사',
};

export const PROGRAM_TYPE_LABEL: Record<ProgramSessionType, string> = {
  STANDARD: '일반',
  TRAINING: '연수',
};

/** 화면에 쓰는 원장 행. id 는 UUID 신청 ID */
export interface LedgerRow {
  id: string;
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

/** 서버 필터와 1:1 로 대응하는 관리대장 필터 */
export interface LedgerFilter {
  session: string;
  status: AdminApplicationStatus | '';
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
    refetchInterval: LEDGER_REFRESH_MS,
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

const RECENT_APPLICATION_COUNT = 10;

export const useRecentApplications = (expoId: string) =>
  useQuery({
    queryKey: ['adminApplications', expoId, 'recent'],
    queryFn: () =>
      getAdminApplications(expoId, {
        sort: 'CREATED_DESC',
        page: 0,
        size: RECENT_APPLICATION_COUNT,
      }),
    refetchInterval: LEDGER_REFRESH_MS,
    select: (data) => data.items.map(toLedgerRow),
  });

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
 * 관리자 취소 실패 안내. 서버 사유(입장·마감·상태 변경 등)는 프록시를 거치며 공통 문구가 되므로
 * 상태로 나눠 안내한다
 */
const getCancellationErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 403:
      return '이 행사의 신청을 취소할 권한이 없습니다.';
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

/** 회차 정의 일시 (YYYY-MM-DDTHH:mm) → 10.31(토) 09:30 ~ 12:30 */
export const formatDefinitionSchedule = (
  startedAt: string | null,
  endedAt: string | null,
) => {
  if (!startedAt) return '-';
  const date = formatDateWithWeekday(startedAt.slice(0, 10));
  return endedAt
    ? `${date} ${timeOf(startedAt)} ~ ${timeOf(endedAt)}`
    : `${date} ${timeOf(startedAt)}`;
};
