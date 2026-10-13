import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ApplicationActivityAction,
  ApplicationActivityQuery,
  getApplicationActivities,
} from '../api/sessionApi';
import { LEDGER_REFRESH_MS } from './ledger';

export const ACTIVITY_ACTION_LABEL: Record<ApplicationActivityAction, string> =
  {
    APPLIED: '신청',
    CANCELLED: '취소',
    PROMOTED: '대기 승급',
  };

/** 서버가 유형을 늘려도 화면이 비지 않게 모르는 값은 그대로 보여 준다 */
export const formatActivityAction = (action: string) =>
  ACTIVITY_ACTION_LABEL[action as ApplicationActivityAction] ?? action;

/** actorId 는 관리자 취소에만 있다. null 은 알 수 없음이 아니라 과거·자동 처리다 */
export const formatActivityActor = (actorId: number | null) =>
  actorId === null ? '자동 처리' : `관리자 ${actorId}`;

export const useApplicationActivities = (
  expoId: string,
  query: ApplicationActivityQuery,
) =>
  useQuery({
    queryKey: ['adminApplicationActivities', expoId, query],
    queryFn: () => getApplicationActivities(expoId, query),
    placeholderData: keepPreviousData,
    refetchInterval: LEDGER_REFRESH_MS,
  });
