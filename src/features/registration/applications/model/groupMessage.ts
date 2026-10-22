import { useQuery } from '@tanstack/react-query';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  getGroupMessageConfig,
  getGroupMessageJob,
  GroupMessageFilter,
  GroupMessageJobStatus,
  GroupMessageScope,
  GroupMessageSource,
  PreregisterGroupMessageFilter,
} from '../../common/api/groupMessageApi';
import { AdminPreregisterStatus } from '../../common/api/preregisterLedgerApi';
import {
  LedgerFilter,
  parseSessionKey,
  toStatusList,
} from '../../common/model/ledger';
import { PreregisterFilter } from '../../common/model/preregisterLedger';

export const GROUP_MESSAGE_MAX_LENGTH = 1000;
export const GROUP_MESSAGE_SELECTED_MAX = 1000;

/** 서버가 신청 시점 스냅샷으로 채우는 변수. 값이 없으면 미리보기에 TEMPLATE_DATA_MISSING 으로 표시된다 */
export const GROUP_MESSAGE_VARIABLES = [
  '{이름}',
  '{프로그램}',
  '{일시}',
  '{장소}',
  '{상태}',
];

export const JOB_STATUS_LABEL: Record<GroupMessageJobStatus, string> = {
  QUEUED: '대기 중',
  RUNNING: '발송 중',
  PAUSED: '일시 중지',
  COMPLETED: '완료',
  COMPLETED_WITH_FAILURES: '일부 실패',
  ATTENTION: '확인 필요',
};

const FINAL_JOB_STATUSES: GroupMessageJobStatus[] = [
  'COMPLETED',
  'COMPLETED_WITH_FAILURES',
  'ATTENTION',
];

export const isFinalJobStatus = (status: GroupMessageJobStatus) =>
  FINAL_JOB_STATUSES.includes(status);

export type PreviewStatus = 'CURRENT' | 'CHANGED' | 'EXPIRED';

/** 미리보기로 보낼 수 있는지. 범위·문구가 바뀌었거나 유효 시간이 지나면 보낼 수 없다 */
export const getPreviewStatus = (
  preview: { source: GroupMessageSource; result: { expiresAt: string } },
  source: GroupMessageSource,
  now: number,
): PreviewStatus =>
  JSON.stringify(preview.source) !== JSON.stringify(source)
    ? 'CHANGED'
    : Date.parse(preview.result.expiresAt) <= now
      ? 'EXPIRED'
      : 'CURRENT';

/** 서버가 필터 전체 발송에 쓸 수 없는 사람 조건. 있으면 선택 발송만 할 수 있다 */
export const getFilteredScopeBlocker = (filter: LedgerFilter) =>
  filter.q.trim() || filter.occupation
    ? '이름·연락처 검색이나 직업 조건이 있으면 현재 필터 전체로 보낼 수 없습니다. 조건을 지우거나 신청을 선택해서 보내주세요.'
    : null;

/** 그룹 문자의 필터 전체 범위는 원장 필터를 받는다. 사람 조건은 getFilteredScopeBlocker 로 막는다 */
export const toGroupMessageFilter = (
  filter: LedgerFilter,
): GroupMessageFilter => {
  const search = filter.search.trim();
  const status = toStatusList(filter.status);
  return {
    ...(parseSessionKey(filter.session) ?? {}),
    ...(status.length > 0 && { status }),
    ...(filter.eventDate && { eventDate: filter.eventDate }),
    ...(search && { search }),
    sort: filter.sort,
  };
};

export type GroupMessageTab = 'PROGRAM' | 'PREREGISTER';

/** 모달이 받는 대상. 탭마다 선택 단위(신청 ID / 대장 key)와 필터 모양이 다르다 */
export type GroupMessageTarget = {
  /** 선택한 행 수. 선택 범위의 건수로 보여 준다 */
  selectedIds: string[];
  /** 현재 필터 전체 건수 */
  filterCount: number;
  /** 필터 전체로 보낼 수 없는 조건이 있으면 사유 */
  filterBlocker: string | null;
} & (
  | { tab: 'PROGRAM'; filter: GroupMessageFilter }
  | { tab: 'PREREGISTER'; filter: PreregisterGroupMessageFilter }
);

export const toGroupMessageScope = (
  target: GroupMessageTarget,
  kind: 'SELECTED' | 'FILTERED',
): GroupMessageScope => {
  if (kind === 'FILTERED') {
    return { kind, filter: target.filter } as GroupMessageScope;
  }
  return target.tab === 'PROGRAM'
    ? { kind, applicationIds: target.selectedIds }
    : { kind, keys: target.selectedIds };
};

/** 사전등록 필터 전체 범위. 빈 조건은 서버가 400 으로 거절하므로 값이 있는 것만 보낸다 */
export const toPreregisterGroupMessageFilter = (
  filter: PreregisterFilter,
): PreregisterGroupMessageFilter => {
  const sessionId = Number(filter.session);
  const q = filter.q.trim();
  return {
    ...(filter.session !== '' && Number.isInteger(sessionId) && { sessionId }),
    ...(filter.status && {
      status: filter.status.split(',') as AdminPreregisterStatus[],
    }),
    ...(q && { q }),
  };
};

export const useGroupMessageConfig = (expoId: string) =>
  useQuery({
    queryKey: ['groupMessageConfig', expoId],
    queryFn: () => getGroupMessageConfig(expoId),
  });

export const isGoneJobError = (error: unknown) => {
  const status = getErrorStatus(error);
  return status === 404 || status === 409;
};

const JOB_POLL_MS = 3 * 1000;

/** 작업이 끝날 때까지 진행 상태를 다시 조회한다 */
export const useGroupMessageJob = (expoId: string, jobId: string | null) =>
  useQuery({
    queryKey: ['groupMessageJob', expoId, jobId],
    queryFn: () => getGroupMessageJob(expoId, jobId!),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      // 보관 작업이 만료(404)되거나 다른 관리자 소유(409)면 더 조회하지 않는다
      if (isGoneJobError(query.state.error)) return false;
      const status = query.state.data?.status;
      return status && isFinalJobStatus(status) ? false : JOB_POLL_MS;
    },
  });

/** 모달을 닫았다 열어도 마지막 발송 작업을 이어 보도록 세션 스토리지에 둔다. 서버에 jobId 목록 API 가 없다 */
export interface LastGroupMessageJob {
  jobId: string;
  source: GroupMessageSource;
  targetFingerprint: string;
}

// 프로그램 탭의 기존 키는 그대로 두고, 사전등록 탭은 따로 보관해 서로의 작업을 이어 보지 않게 한다
const lastJobKey = (expoId: string, tab: GroupMessageTab) =>
  tab === 'PROGRAM'
    ? `groupMessageLastJob:${expoId}`
    : `groupMessageLastJob:preregister:${expoId}`;

export const loadLastGroupMessageJob = (
  expoId: string,
  tab: GroupMessageTab,
): LastGroupMessageJob | null => {
  try {
    const raw = sessionStorage.getItem(lastJobKey(expoId, tab));
    return raw ? (JSON.parse(raw) as LastGroupMessageJob) : null;
  } catch {
    return null;
  }
};

export const saveLastGroupMessageJob = (
  expoId: string,
  tab: GroupMessageTab,
  last: LastGroupMessageJob | null,
) => {
  try {
    const key = lastJobKey(expoId, tab);
    if (last) sessionStorage.setItem(key, JSON.stringify(last));
    else sessionStorage.removeItem(key);
  } catch {
    // 스토리지를 못 쓰면 이번 모달 안에서만 추적한다
  }
};
