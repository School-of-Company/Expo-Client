import { useQuery } from '@tanstack/react-query';
import {
  getGroupMessageConfig,
  getGroupMessageJob,
  GroupMessageFilter,
  GroupMessageJobStatus,
} from '../../common/api/groupMessageApi';
import { LedgerFilter, parseSessionKey } from '../../common/model/ledger';

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

/** 그룹 문자의 필터 전체 범위는 원장 필터를 그대로 받는다(제목, 이름·번호, 직업 포함) */
export const toGroupMessageFilter = (
  filter: LedgerFilter,
): GroupMessageFilter => {
  const q = filter.q.trim();
  const search = filter.search.trim();
  return {
    ...(parseSessionKey(filter.session) ?? {}),
    status: filter.status || null,
    ...(search && { search }),
    ...(q && { q }),
    ...(filter.occupation && { occupation: filter.occupation }),
    sort: filter.sort,
  };
};

export const useGroupMessageConfig = (expoId: string) =>
  useQuery({
    queryKey: ['groupMessageConfig', expoId],
    queryFn: () => getGroupMessageConfig(expoId),
  });

const JOB_POLL_MS = 3 * 1000;

/** 작업이 끝날 때까지 진행 상태를 다시 조회한다 */
export const useGroupMessageJob = (expoId: string, jobId: string | null) =>
  useQuery({
    queryKey: ['groupMessageJob', expoId, jobId],
    queryFn: () => getGroupMessageJob(expoId, jobId!),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isFinalJobStatus(status) ? false : JOB_POLL_MS;
    },
  });
