import {
  keepPreviousData,
  useInfiniteQuery,
  useQueries,
} from '@tanstack/react-query';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import { StatusBadgeTone } from '../../common';
import { parseSessionKey } from '../../common/model/ledger';
import {
  AdminApplicationAction,
  AdminApplicationActivity,
  AdminApplicationActorType,
  AdminApplicationActivityQuery,
  getAdminApplicationActivities,
} from '../api/applicationActivityApi';

export const ACTIVITY_PAGE_SIZE = 20;

export const ACTIVITY_ACTION_LABEL: Record<AdminApplicationAction, string> = {
  APPLIED: '신청',
  CANCELLED: '취소',
  PROMOTED: '대기 승급',
};

const ACTIVITY_ACTION_TONE: Record<AdminApplicationAction, StatusBadgeTone> = {
  APPLIED: 'main',
  CANCELLED: 'error',
  PROMOTED: 'gray',
};

export const ACTIVITY_ACTIONS = Object.keys(
  ACTIVITY_ACTION_LABEL,
) as AdminApplicationAction[];

const isActivityAction = (action: string): action is AdminApplicationAction =>
  action in ACTIVITY_ACTION_LABEL;

// 모르는 유형은 서버 값을 그대로 보여 준다
export const getActivityActionLabel = (action: string) =>
  isActivityAction(action) ? ACTIVITY_ACTION_LABEL[action] : action;

export const getActivityActionTone = (action: string): StatusBadgeTone =>
  isActivityAction(action) ? ACTIVITY_ACTION_TONE[action] : 'outline';

const ACTIVITY_ACTOR_LABEL: Record<AdminApplicationActorType, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  SYSTEM: '자동 처리',
  UNKNOWN: '미기록',
};

/** 주체가 기록되지 않은 과거 이력(UNKNOWN)은 사용자·자동으로 단정하지 않는다 */
export const getActivityActorLabel = ({
  actorType,
  actorId,
}: Pick<AdminApplicationActivity, 'actorType' | 'actorId'>) => {
  const label = ACTIVITY_ACTOR_LABEL[actorType ?? 'UNKNOWN'] ?? '미기록';
  return actorType === 'ADMIN' && actorId !== null
    ? `${label} #${actorId}`
    : label;
};

export const MAX_PARTICIPANT_LENGTH = 50;

/** 처리일은 관리자 로컬 일시 'YYYY-MM-DDTHH:mm'. 조회할 때 UTC 로 바꾼다 */
export interface ActivityFilter {
  action: AdminApplicationAction | '';
  /** 참가자 검색어 */
  participant: string;
  /** `${programType}:${programId}` (toSessionKey) */
  session: string;
  /** 처리 결과 상태 */
  status: string;
  from: string | null;
  /** 이 시각은 포함하지 않는다 */
  to: string | null;
}

export const INITIAL_ACTIVITY_FILTER: ActivityFilter = {
  action: '',
  participant: '',
  session: '',
  status: '',
  from: null,
  to: null,
};

const toUtcIso = (local: string | null) =>
  local ? new Date(local).toISOString() : undefined;

export const isActivityRangeInvalid = ({ from, to }: ActivityFilter) =>
  Boolean(from && to && new Date(from) >= new Date(to));

// 서버는 빈 값을 400 으로 거절한다. undefined 는 axios 가 보내지 않는다
const toActivityQuery = (
  filter: ActivityFilter,
  page: number,
  size: number,
): AdminApplicationActivityQuery => ({
  page,
  size,
  action: filter.action || undefined,
  q: filter.participant.trim() || undefined,
  ...parseSessionKey(filter.session),
  status: filter.status || undefined,
  from: toUtcIso(filter.from),
  until: toUtcIso(filter.to),
});

/**
 * 오프셋 페이지를 "더 보기"로 이어 붙인다. 조회 사이에 새 이력이 생기면 앞 페이지 행이
 * 밀려 다음 페이지에 다시 나올 수 있어 id 로 한 번만 남긴다. 조건이 바뀌면 첫 페이지부터 다시 읽는다
 */
export const useAdminApplicationActivities = (
  expoId: string,
  filter: ActivityFilter = INITIAL_ACTIVITY_FILTER,
) =>
  useInfiniteQuery({
    queryKey: ['adminApplicationActivities', expoId, filter],
    queryFn: ({ pageParam }) =>
      getAdminApplicationActivities(
        expoId,
        toActivityQuery(filter, pageParam, ACTIVITY_PAGE_SIZE),
      ),
    // 시작이 종료보다 늦으면 서버가 400 으로 거절하므로 보내지 않는다
    enabled: !isActivityRangeInvalid(filter),
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    getNextPageParam: ({ page, size, totalElements }) =>
      (page + 1) * size < totalElements ? page + 1 : undefined,
    select: ({ pages }) => {
      const seen = new Set<number>();
      const items: AdminApplicationActivity[] = [];
      pages.forEach((page) =>
        page.items.forEach((item) => {
          if (seen.has(item.id)) return;
          seen.add(item.id);
          items.push(item);
        }),
      );
      return { items, totalElements: pages.at(-1)?.totalElements ?? 0 };
    },
  });

export type ActivityCounts = Record<'total' | AdminApplicationAction, number>;

/**
 * 처리유형을 뺀 나머지 조건(검색·프로그램·상태·처리일) 안의 전체·유형별 건수.
 * 집계 API 가 없어 유형마다 size=1(서버 최소)로 조회해 totalElements 만 읽는다.
 * 결과 상태 조건이 있으면 그 상태로 끝난 이력만 센다
 */
export const useActivityCounts = (
  expoId: string,
  { action: _action, ...range }: ActivityFilter,
) => {
  const actions = ['', ...ACTIVITY_ACTIONS] as const;
  return useQueries({
    queries: actions.map((action) => ({
      queryKey: ['adminApplicationActivityCount', expoId, action, range],
      queryFn: () =>
        getAdminApplicationActivities(
          expoId,
          toActivityQuery({ ...range, action }, 0, 1),
        ),
      enabled: !isActivityRangeInvalid({ ...range, action }),
      placeholderData: keepPreviousData,
      // 실패는 목록 영역에서 알린다. 건수 4개가 같은 오류를 겹쳐 띄우지 않게 한다
      meta: { silent: true },
    })),
    combine: (results): ActivityCounts | null =>
      results.every(({ data }) => data)
        ? {
            total: results[0].data!.totalElements,
            APPLIED: results[1].data!.totalElements,
            CANCELLED: results[2].data!.totalElements,
            PROMOTED: results[3].data!.totalElements,
          }
        : null,
  });
};

/** 503 은 권한 확인(Expo) 장애다 */
export const getActivityErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return error instanceof ApiError
        ? error.message
        : '조회 조건이 올바르지 않습니다.';
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '신청 처리 이력을 조회할 권한이 없습니다.';
    case 404:
      return '박람회를 찾을 수 없습니다.';
    case 502:
    case 503:
      return '지금은 권한을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '신청 처리 이력을 불러오지 못했습니다.';
  }
};
