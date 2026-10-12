import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  AdminApplicationSort,
  AdminApplicationStatus,
  AdminOccupation,
  ProgramSessionType,
} from './ledgerApi';

// Expo-Application-Server AdminGroupMessageController (docs/admin-group-messaging.md)

/** 원장과 같은 필터. status 가 null 이면 모든 상태 */
export interface GroupMessageFilter {
  programType?: ProgramSessionType;
  programId?: number;
  status: AdminApplicationStatus | null;
  q?: string;
  occupation?: AdminOccupation;
  sort: AdminApplicationSort;
}

export type GroupMessageScope =
  | { kind: 'SELECTED'; applicationIds: string[] }
  | { kind: 'FILTERED'; filter: GroupMessageFilter };

/** 서버는 알 수 없는 필드를 거절하므로 SMS 에 필요한 값만 보낸다 */
export interface GroupMessageSource {
  scope: GroupMessageScope;
  channel: 'SMS';
  body: string;
}

export interface GroupMessageConfig {
  enabled: boolean;
  channels: Partial<Record<'SMS' | 'KAKAO', { enabled: boolean }>>;
}

export interface GroupMessagePreviewItem {
  targetId: string;
  applicationId: string;
  recipientMasked: string | null;
  content: string | null;
  missingReason: string | null;
}

export interface GroupMessagePreview {
  previewId: string;
  targetFingerprint: string;
  /** 중복 제거 전 신청 원장 행 수 */
  applicationCount: number;
  /** 발송 가능한 정규화 수신번호 수 */
  recipientCount: number;
  /** 발송 가능한 개별 문구 수 */
  messageCount: number;
  missingCount: number;
  expiresAt: string;
  items: GroupMessagePreviewItem[];
}

export type GroupMessageJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'COMPLETED_WITH_FAILURES'
  | 'ATTENTION';

export interface GroupMessageJob {
  jobId: string;
  previewId: string;
  status: GroupMessageJobStatus;
  createdAt: string;
  counts: {
    total: number;
    pending: number;
    sending: number;
    accepted: number;
    delivered: number;
    failed: number;
    unknown: number;
    missing: number;
  };
}

/** 실행·재시도는 미리보기와 같은 source 와 fingerprint, 새 멱등 키를 보낸다 */
export interface GroupMessageExecuteRequest {
  source: GroupMessageSource;
  targetFingerprint: string;
  idempotencyKey: string;
}

const basePath = (expoId: string) =>
  `/application/expos/${encodeURIComponent(expoId)}/admin-group-messages`;

const request = async <T>(
  call: () => Promise<{ data: T }>,
  fallback: string,
) => {
  try {
    return (await call()).data;
  } catch (error) {
    throw toApiError(error, fallback);
  }
};

export const getGroupMessageConfig = (expoId: string) =>
  request<GroupMessageConfig>(
    () => clientTokenInstance.get(`${basePath(expoId)}/config`),
    '문자 발송 설정을 불러오지 못했습니다.',
  );

export const postGroupMessagePreview = (
  expoId: string,
  source: GroupMessageSource,
) =>
  request<GroupMessagePreview>(
    () =>
      clientTokenInstance.post(`${basePath(expoId)}/previews`, {
        requestId: crypto.randomUUID(),
        source,
      }),
    '미리보기를 만들지 못했습니다.',
  );

export const postGroupMessageJob = (
  expoId: string,
  previewId: string,
  body: GroupMessageExecuteRequest,
) =>
  request<GroupMessageJob>(
    () =>
      clientTokenInstance.post(
        `${basePath(expoId)}/previews/${encodeURIComponent(previewId)}/jobs`,
        body,
      ),
    '발송을 시작하지 못했습니다.',
  );

export const getGroupMessageJob = (expoId: string, jobId: string) =>
  request<GroupMessageJob>(
    () =>
      clientTokenInstance.get(
        `${basePath(expoId)}/jobs/${encodeURIComponent(jobId)}`,
      ),
    '발송 상태를 불러오지 못했습니다.',
  );

export const postGroupMessageRetry = (
  expoId: string,
  jobId: string,
  body: GroupMessageExecuteRequest,
) =>
  request<GroupMessageJob>(
    () =>
      clientTokenInstance.post(
        `${basePath(expoId)}/jobs/${encodeURIComponent(jobId)}/retries`,
        body,
      ),
    '재시도를 요청하지 못했습니다.',
  );
