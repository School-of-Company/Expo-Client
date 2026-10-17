'use client';

import { QueryKey, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { normalizeExpoId } from '@/shared/config/expoRoutes';
import { createCoalescedRunner, createRecentIds } from './coalesce';
import {
  AdminRealtimeResource,
  parseAdminDataChanged,
  toRealtimeStreamUrl,
} from './contract';
import { createStreamClient, StreamStatus } from './streamClient';

export interface AdminRealtimeTarget {
  resource: AdminRealtimeResource;
  /** 이 리소스가 바뀌면 다시 읽을 기존 GET 의 키(접두). 필터·페이지는 키 뒤쪽이라 현재 조건 그대로 다시 읽는다 */
  queryKeys: QueryKey[];
}

type RealtimeStatusMap = Partial<Record<AdminRealtimeResource, StreamStatus>>;

// Provider 밖(SSE 를 쓰지 않는 화면)에서는 비어 있어 기존 polling 을 그대로 쓴다
const RealtimeStatusContext = createContext<RealtimeStatusMap | null>(null);

// 스캔이 몰리는 입퇴장은 더 넓게 모은다
const COALESCE: Record<
  AdminRealtimeResource,
  { delayMs: number; minIntervalMs: number }
> = {
  APPLICATIONS: { delayMs: 300, minIntervalMs: 1_000 },
  ATTENDANCE: { delayMs: 500, minIntervalMs: 2_000 },
};

const RECENT_EVENT_LIMIT = 256;

interface AdminRealtimeProviderProps {
  expoId: string;
  targets: AdminRealtimeTarget[];
  children: ReactNode;
}

/**
 * 화면 하나에서 리소스마다 SSE 연결을 하나만 연다. 신호를 받으면 데이터를 직접 고치지 않고
 * 기존 GET 을 invalidate 해서 다시 읽는다(탭·필터·페이지·스크롤은 그대로).
 * 연결·재연결·화면 복귀 때도 GET 으로 맞추고, 박람회가 바뀌거나 화면을 떠나면 연결과 타이머를 정리한다
 */
export const AdminRealtimeProvider = ({
  expoId,
  targets,
  children,
}: AdminRealtimeProviderProps) => {
  const queryClient = useQueryClient();
  const [statuses, setStatuses] = useState<RealtimeStatusMap>({});
  // 키 목록은 렌더마다 새 배열이어도 연결을 다시 열지 않도록 ref 로 읽는다
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  const serverExpoId = normalizeExpoId(expoId);
  const resourceKey = Array.from(new Set(targets.map((t) => t.resource)))
    .sort()
    .join(',');

  useEffect(() => {
    if (!serverExpoId || !resourceKey) return undefined;
    const resources = resourceKey.split(',') as AdminRealtimeResource[];
    const recentIds = createRecentIds(RECENT_EVENT_LIMIT);

    const runners = new Map(
      resources.map((resource) => [
        resource,
        createCoalescedRunner(
          () =>
            Promise.all(
              targetsRef.current
                .filter((target) => target.resource === resource)
                .flatMap(({ queryKeys }) => queryKeys)
                .map((queryKey) => queryClient.invalidateQueries({ queryKey })),
            ),
          COALESCE[resource],
        ),
      ]),
    );
    const resync = (resource: AdminRealtimeResource) =>
      runners.get(resource)?.trigger();

    const clients = resources.map((resource) =>
      createStreamClient({
        url: toRealtimeStreamUrl(resource, serverExpoId),
        onOpen: () => resync(resource),
        onMessage: (message) => {
          const event = parseAdminDataChanged(message);
          // 다른 행사 신호나 이미 처리한 신호는 버린다
          if (!event || event.expoId !== serverExpoId.toLowerCase()) return;
          if (!recentIds.add(`${event.resource}:${event.eventId}`)) return;
          resync(event.resource);
        },
        onStatus: (status) =>
          setStatuses((prev) => ({ ...prev, [resource]: status })),
      }),
    );
    clients.forEach((client) => client.start());

    // 숨겨진 탭은 브라우저가 스트림을 늦추거나 멈출 수 있어 돌아오면 다시 맞춘다
    const handleVisible = () => {
      if (document.visibilityState !== 'visible') return;
      clients.forEach((client) => client.resume());
      resources.forEach(resync);
    };
    const handleOnline = () => clients.forEach((client) => client.resume());
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('online', handleOnline);
      clients.forEach((client) => client.stop());
      runners.forEach((runner) => runner.dispose());
      setStatuses({});
    };
  }, [queryClient, serverExpoId, resourceKey]);

  return (
    <RealtimeStatusContext.Provider value={statuses}>
      {children}
    </RealtimeStatusContext.Provider>
  );
};

/**
 * 기존 polling 주기. 화면이 쓰는 리소스가 모두 SSE 로 연결돼 있으면 polling 을 멈추고(false),
 * 연결 전·재연결 중·실패 후나 SSE 를 쓰지 않는 화면에서는 원래 주기를 그대로 쓴다
 */
export const useRealtimeRefetchInterval = (
  intervalMs: number,
  ...resources: AdminRealtimeResource[]
): number | false => {
  const statuses = useContext(RealtimeStatusContext);
  if (!statuses || resources.length === 0) return intervalMs;
  return resources.every((resource) => statuses[resource] === 'connected')
    ? false
    : intervalMs;
};

export type RealtimeSummary = 'live' | 'connecting' | 'fallback' | 'denied';

// 여러 연결 중 가장 나쁜 상태를 보여 준다
const SUMMARY_ORDER: RealtimeSummary[] = [
  'denied',
  'fallback',
  'connecting',
  'live',
];

const toSummary = (status: StreamStatus): RealtimeSummary => {
  switch (status) {
    case 'connected':
      return 'live';
    case 'connecting':
    case 'reconnecting':
      return 'connecting';
    default:
      return status;
  }
};

/** 화면의 실시간 연결 요약. SSE 를 쓰지 않는 화면이면 null */
export const useRealtimeSummary = (): RealtimeSummary | null => {
  const statuses = useContext(RealtimeStatusContext);
  if (!statuses) return null;
  const summaries = Object.values(statuses).map(toSummary);
  if (summaries.length === 0) return 'connecting';
  return SUMMARY_ORDER.find((summary) => summaries.includes(summary)) ?? null;
};
