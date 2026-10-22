import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  AdminApplicationSort,
  AdminApplicationStatus,
  ProgramSessionType,
} from './ledgerApi';

// Expo-Application-Server AdminGroupMessageController (docs/admin-group-messaging.md)

/**
 * 원장과 같은 필터. status 를 생략하면 모든 상태.
 * 이름·번호(q)와 직업은 서버가 적용할 수 없어 400 으로 거절하므로 받지 않는다
 */
export interface GroupMessageFilter {
  programType?: ProgramSessionType;
  programId?: number;
  status?: AdminApplicationStatus[];
  /** 제출 당시 회차 시작일(KST, YYYY-MM-DD) */
  eventDate?: string;
  /** 제출 당시 제목 */
  search?: string;
  sort: AdminApplicationSort;
}

export type GroupMessageScope =
  | { kind: 'SELECTED'; applicationIds: string[] }
  | { kind: 'FILTERED'; filter: GroupMessageFilter };

export type GroupMessageChannel = 'SMS' | 'KAKAO';

/**
 * SMS 는 body, 카카오는 승인 templateId 를 보낸다. 서버는 알 수 없는 필드를 400 으로 거절한다.
 * 카카오는 서버가 알림톡과 같은 본문의 문자를 항상 함께 보낸다. fallbackToSms 는 서버가
 * 하위 호환으로 받기만 하고 발송에는 쓰지 않는다
 */
export type GroupMessageSource =
  | {
      scope: GroupMessageScope;
      channel: 'SMS';
      body: string;
      fallbackToSms: false;
    }
  | {
      scope: GroupMessageScope;
      channel: 'KAKAO';
      templateId: string;
      fallbackToSms: true;
    };

/** 카카오 템플릿 자리표시자 → 서버가 채우는 신청 값 */
export interface KakaoVariableMapping {
  expoName?: string;
  name?: string;
  programName?: string;
  sessionName?: string;
  location?: string;
  status?: string;
  // 받는 사람별 QR 페이지 링크와 신청 내역(여러 줄)
  applicationUrl?: string;
  applicationSummary?: string;
}

export interface KakaoTemplate {
  id: string;
  name: string;
  content: string;
  variableMapping: KakaoVariableMapping;
  // 모든 수신자에게 같은 값으로 채우는 자리표시자 → 고정값. 구버전 응답에는 없다
  fixedVariables?: Record<string, string>;
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
  participantId: number | null;
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
  targetCount: number;
  sendableCount: number;
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
  participantId: number | null;
  recipientMasked: string | null;
  status: GroupMessageItemStatus;
  providerCode: string | null;
  failureReason: string | null;
  missingReason: string | null;
}

/** 실행·재시도는 미리보기와 같은 source 와 fingerprint, 제출마다 하나의 멱등 키를 보낸다 */
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
