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
  /** 제출 당시 제목 */
  search?: string;
  q?: string;
  occupation?: AdminOccupation;
  sort: AdminApplicationSort;
}

export type GroupMessageScope =
  | { kind: 'SELECTED'; applicationIds: string[] }
  | { kind: 'FILTERED'; filter: GroupMessageFilter };

export type GroupMessageChannel = 'SMS' | 'KAKAO';

/**
 * 서버는 알 수 없는 필드를 거절한다. SMS 는 body, 카카오는 승인 templateId 만 보낸다.
 * SMS 자동 대체(fallbackToSms)는 서버가 항상 false 로 처리하므로 보내지 않는다
 */
export type GroupMessageSource =
  | { scope: GroupMessageScope; channel: 'SMS'; body: string }
  | { scope: GroupMessageScope; channel: 'KAKAO'; templateId: string };

/** 카카오 템플릿 자리표시자 → 서버가 채우는 신청 값 */
export interface KakaoVariableMapping {
  name?: string;
  programName?: string;
  sessionName?: string;
  location?: string;
}

export interface KakaoTemplate {
  id: string;
  name: string;
  content: string;
  variableMapping: KakaoVariableMapping;
  variables: string[];
}

export interface GroupMessageConfig {
  enabled: boolean;
  channels: Partial<
    Record<
      GroupMessageChannel,
      { enabled: boolean; templates?: KakaoTemplate[] }
    >
  >;
  smsFallbackDefault: boolean;
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
  items: GroupMessageJobItem[];
}

export type GroupMessageItemStatus =
  | 'MISSING'
  | 'PENDING'
  | 'SENDING'
  | 'ACCEPTED'
  | 'DELIVERED'
  | 'FAILED'
  | 'UNKNOWN';

export interface GroupMessageJobItem {
  targetId: string;
  applicationId: string;
  recipientMasked: string | null;
  status: GroupMessageItemStatus;
  failureReason: string | null;
  missingReason: string | null;
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
