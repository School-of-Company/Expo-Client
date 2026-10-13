import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminApplicationQuery,
  AdminApplicationRow,
  AdminApplicationSort,
  AdminApplicationStatus,
  AdminOccupation,
  getAdminApplications,
  getAdminApplicationSummary,
  getAdminCurrentSessions,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../api/ledgerApi';
import { getPreregistrationSummary } from '../api/preregistrationSummaryApi';
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
  /** 참가자 원천(User)에서 받지 못한 행 */
  isParticipantMissing: boolean;
  /** 대표자면 true, 동행자면 false. 참가자 정보가 없으면 null */
  isRepresentative: boolean | null;
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
  name: row.participant?.name ?? '-',
  phoneNumber: row.participant?.phoneNumber ?? null,
  notificationPhoneNumber: row.participant?.notificationPhoneNumber ?? null,
  occupation: row.participant?.occupation ?? null,
  isParticipantMissing: row.participant === null,
  isRepresentative: row.participant
    ? row.participant.representativeId === null
    : null,
  linkedTraineeId: row.participant?.linkedTraineeId ?? null,
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
  /** 참가자 이름·번호 */
  q: string;
  occupation: AdminOccupation | '';
  sort: AdminApplicationSort;
}

export const INITIAL_LEDGER_FILTER: LedgerFilter = {
  session: '',
  status: '',
  q: '',
  occupation: '',
  sort: 'CREATED_DESC',
};

export const Q_MAX_LENGTH = 50;

export const toLedgerQuery = (
  filter: LedgerFilter,
  page: number,
): AdminApplicationQuery => {
  const session = parseSessionKey(filter.session);
  const q = filter.q.trim();
  return {
    ...(session ?? {}),
    status: filter.status || undefined,
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
    queryFn: () => getAdminCurrentSessions(expoId),
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
  });

/** 관리자 원장은 참가자 원천(User) 조회가 하나라도 실패하면 전체를 502 로 거절한다 */
export const getLedgerErrorMessage = (error: unknown, fallback: string) =>
  getErrorStatus(error) === 502
    ? '참가자 정보를 불러오지 못해 목록을 표시하지 않습니다. 잠시 후 다시 시도해주세요.'
    : fallback;

export const usePreregistrationSummary = (expoId: string) =>
  useQuery({
    queryKey: ['adminPreregistrationSummary', expoId],
    queryFn: () => getPreregistrationSummary(expoId),
    refetchInterval: LEDGER_REFRESH_MS,
  });

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
