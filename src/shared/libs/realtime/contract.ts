import { normalizeExpoId } from '@/shared/config/expoRoutes';
import type { SseMessage } from './sseParser';

/**
 * 관리자 화면 갱신 신호(SSE) 계약. Application #162 · Attendance #141 에서 확정된 경로와 이벤트를 따른다.
 * 서버 경로나 이벤트 이름이 바뀌면 이 파일만 고친다.
 */

/** 데이터가 바뀌었다는 신호. heartbeat 는 다른 이름(또는 주석 줄)으로 오므로 화면을 갱신하지 않는다 */
export const ADMIN_DATA_CHANGED_EVENT = 'admin-data-changed';

export const ADMIN_REALTIME_RESOURCES = ['APPLICATIONS', 'ATTENDANCE'] as const;

export type AdminRealtimeResource = (typeof ADMIN_REALTIME_RESOURCES)[number];

/** 브라우저가 부르는 same-origin 스트림 경로의 세그먼트 */
const RESOURCE_SEGMENT: Record<AdminRealtimeResource, string> = {
  APPLICATIONS: 'applications',
  ATTENDANCE: 'attendance',
};

/**
 * Gateway 의 스트림 경로. Application #166 · Attendance #144 가 정한 경로다.
 * expoId 는 normalizeExpoId 를 거친 값만 넣는다
 */
const UPSTREAM_STREAM_PATH: Record<
  AdminRealtimeResource,
  (expoId: string) => string
> = {
  APPLICATIONS: (expoId) =>
    `/application/admin/expos/${encodeURIComponent(expoId)}/events`,
  ATTENDANCE: (expoId) =>
    `/attendance/summary/${encodeURIComponent(expoId)}/events`,
};

/** 브라우저가 연결할 BFF 경로. 인증정보는 HttpOnly 쿠키로만 가고 쿼리에는 싣지 않는다 */
export const toRealtimeStreamUrl = (
  resource: AdminRealtimeResource,
  expoId: string,
) =>
  `/api/realtime/${RESOURCE_SEGMENT[resource]}/${encodeURIComponent(expoId)}`;

/** BFF 경로의 세그먼트를 Gateway 경로로. 모르는 리소스·형식이 다른 박람회 ID 면 null */
export const toUpstreamStreamPath = (
  segment: string,
  rawExpoId: string,
): string | null => {
  const resource = ADMIN_REALTIME_RESOURCES.find(
    (value) => RESOURCE_SEGMENT[value] === segment,
  );
  const expoId = normalizeExpoId(rawExpoId);
  if (!resource || !expoId) return null;
  return UPSTREAM_STREAM_PATH[resource](expoId);
};

export interface AdminDataChangedEvent {
  eventId: string;
  expoId: string;
  resource: AdminRealtimeResource;
  occurredAt: string | null;
  /** 바뀐 회차(선택) */
  sessionId?: string;
  /** 서버 버전(선택) */
  version?: string;
}

const toId = (value: unknown) =>
  typeof value === 'string' && value !== ''
    ? value
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : undefined;

const isResource = (value: unknown): value is AdminRealtimeResource =>
  ADMIN_REALTIME_RESOURCES.includes(value as AdminRealtimeResource);

/**
 * admin-data-changed 메시지를 읽는다. 다른 이벤트(heartbeat 등)나 형식이 틀린 값은 null.
 * 이름·전화번호 같은 값은 계약에 없으므로 읽지 않는다
 */
export const parseAdminDataChanged = (
  message: SseMessage,
): AdminDataChangedEvent | null => {
  if (message.event !== ADMIN_DATA_CHANGED_EVENT) return null;
  let data: unknown;
  try {
    data = JSON.parse(message.data);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  const eventId = toId(record.eventId) ?? message.id;
  const expoId = toId(record.expoId);
  if (!eventId || !expoId || !isResource(record.resource)) return null;

  return {
    eventId,
    expoId: expoId.toLowerCase(),
    resource: record.resource,
    occurredAt:
      typeof record.occurredAt === 'string' ? record.occurredAt : null,
    sessionId: toId(record.sessionId),
    version: toId(record.version),
  };
};
