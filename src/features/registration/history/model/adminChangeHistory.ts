import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminChangeHistoryQuery,
  AdminChangeType,
  getAdminChangeHistory,
} from '../api/adminChangeHistoryApi';

export const HISTORY_PAGE_SIZE = 20;

export const CHANGE_TYPE_LABEL: Record<AdminChangeType, string> = {
  PROGRAM_CREATE: '프로그램 생성',
  PROGRAM_UPDATE: '프로그램 수정',
  PROGRAM_DELETE: '프로그램 삭제',
  SESSION_CREATE: '회차 생성',
  SESSION_UPDATE: '회차 수정',
  SESSION_DELETE: '회차 삭제',
};

export const CHANGE_TYPE_STYLE: Record<AdminChangeType, string> = {
  PROGRAM_CREATE: 'text-main-600',
  PROGRAM_UPDATE: 'text-black',
  PROGRAM_DELETE: 'text-error',
  SESSION_CREATE: 'text-main-600',
  SESSION_UPDATE: 'text-black',
  SESSION_DELETE: 'text-error',
};

// 서버가 이력에 남기는 대상 유형 (Expo-Expo-Server history.record 호출부)
const TARGET_TYPE_LABEL: Record<string, string> = {
  STANDARD: '일반 프로그램',
  TRAINING: '연수 프로그램',
  PREREGISTER_SESSION: '사전등록 회차',
};

const isChangeType = (type: string): type is AdminChangeType =>
  type in CHANGE_TYPE_LABEL;

// 모르는 유형은 서버 값을 그대로 보여 준다
export const getChangeTypeLabel = (type: string) =>
  isChangeType(type) ? CHANGE_TYPE_LABEL[type] : type;

export const getChangeTypeStyle = (type: string) =>
  isChangeType(type) ? CHANGE_TYPE_STYLE[type] : 'text-gray-500';

export const getTargetTypeLabel = (targetType: string) =>
  TARGET_TYPE_LABEL[targetType] ?? targetType;

/** 기간은 관리자 로컬 일시 'YYYY-MM-DDTHH:mm'. 조회할 때 UTC 로 바꾼다 */
export interface HistoryFilter {
  type: AdminChangeType | '';
  from: string | null;
  /** 이 시각은 포함하지 않는다 */
  to: string | null;
}

export const INITIAL_HISTORY_FILTER: HistoryFilter = {
  type: '',
  from: null,
  to: null,
};

const toUtcIso = (local: string | null) =>
  local ? new Date(local).toISOString() : undefined;

export const isHistoryRangeInvalid = ({ from, to }: HistoryFilter) =>
  Boolean(from && to && new Date(from) >= new Date(to));

export const toHistoryQuery = (
  filter: HistoryFilter,
  page: number,
): AdminChangeHistoryQuery => ({
  type: filter.type || undefined,
  from: toUtcIso(filter.from),
  to: toUtcIso(filter.to),
  page,
  size: HISTORY_PAGE_SIZE,
});

export const useAdminChangeHistory = (
  expoId: string,
  filter: HistoryFilter,
  page: number,
) =>
  useQuery({
    queryKey: ['adminChangeHistory', expoId, filter, page],
    queryFn: () => getAdminChangeHistory(expoId, toHistoryQuery(filter, page)),
    // 시작이 종료보다 늦으면 서버가 400 으로 거절하므로 보내지 않는다
    enabled: !isHistoryRangeInvalid(filter),
    placeholderData: keepPreviousData,
  });

export const getHistoryTotalPage = (totalElements: number) =>
  Math.max(Math.ceil(totalElements / HISTORY_PAGE_SIZE), 1);

/** 503 은 권한 확인 서비스 장애이거나 삭제 중인 박람회다 */
export const getHistoryErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return error instanceof ApiError
        ? error.message
        : '조회 조건이 올바르지 않습니다.';
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '변경 이력을 조회할 권한이 없습니다.';
    case 404:
      return '박람회를 찾을 수 없습니다.';
    case 502:
      return '변경 이력 원천의 응답이 올바르지 않습니다. 잠시 후 다시 시도해주세요.';
    case 503:
      return '지금은 권한을 확인할 수 없거나 삭제 중인 박람회입니다. 잠시 후 다시 시도해주세요.';
    default:
      return '변경 이력을 불러오지 못했습니다.';
  }
};

const pad = (value: number) => String(value).padStart(2, '0');

// 오프셋 없는 값도 UTC 로 읽는다. ISO → 2026.10.12 09:30:00 (로컬)
export const formatOccurredAt = (iso: string) => {
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(iso);
  const date = new Date(hasOffset ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
