import { useInfiniteQuery } from '@tanstack/react-query';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminApplicationAction,
  AdminApplicationActivity,
  getAdminApplicationActivities,
} from '../api/applicationActivityApi';

export const ACTIVITY_PAGE_SIZE = 20;

export const ACTIVITY_ACTION_LABEL: Record<AdminApplicationAction, string> = {
  APPLIED: '신청',
  CANCELLED: '취소',
  PROMOTED: '대기 승급',
};

const ACTIVITY_ACTION_STYLE: Record<AdminApplicationAction, string> = {
  APPLIED: 'text-main-600',
  CANCELLED: 'text-error',
  PROMOTED: 'text-black',
};

const isActivityAction = (action: string): action is AdminApplicationAction =>
  action in ACTIVITY_ACTION_LABEL;

// 모르는 유형은 서버 값을 그대로 보여 준다
export const getActivityActionLabel = (action: string) =>
  isActivityAction(action) ? ACTIVITY_ACTION_LABEL[action] : action;

export const getActivityActionStyle = (action: string) =>
  isActivityAction(action) ? ACTIVITY_ACTION_STYLE[action] : 'text-gray-500';

/**
 * 오프셋 페이지를 "더 보기"로 이어 붙인다. 조회 사이에 새 이력이 생기면 앞 페이지 행이
 * 밀려 다음 페이지에 다시 나올 수 있어 id 로 한 번만 남긴다
 */
export const useAdminApplicationActivities = (expoId: string) =>
  useInfiniteQuery({
    queryKey: ['adminApplicationActivities', expoId],
    queryFn: ({ pageParam }) =>
      getAdminApplicationActivities(expoId, {
        page: pageParam,
        size: ACTIVITY_PAGE_SIZE,
      }),
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
