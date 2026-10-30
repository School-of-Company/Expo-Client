'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BadgePrintResolveAction,
  getBadgePrintJobs,
  resolveBadgePrintJob,
} from '../api/badgePrintApi';

const JOBS_REFRESH_MS = 5000;

export const badgePrintJobsQueryKey = (expoId: string) => [
  'badgePrintJobs',
  expoId,
];

/** 오늘 확인이 필요한(NEEDS_CHECK)·실패한(FAILED) 출력 작업과 처리 동작 */
export const useBadgePrintJobs = (expoId: string) => {
  const queryClient = useQueryClient();
  // 같은 작업의 같은 처리는 다시 눌러도 같은 키를 보내 한 번만 처리되게 한다
  const requestKeys = useRef(new Map<string, string>());
  const [resolvingJobId, setResolvingJobId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: badgePrintJobsQueryKey(expoId),
    queryFn: () => getBadgePrintJobs(expoId),
    refetchInterval: JOBS_REFRESH_MS,
    // 5초마다 다시 읽어 끊기면 토스트가 쌓이므로 패널 안에만 표시한다
    meta: { silent: true },
  });

  const resolve = useCallback(
    async (jobId: number, action: BadgePrintResolveAction) => {
      const mapKey = `${jobId}:${action}`;
      const requestKey = requestKeys.current.get(mapKey) ?? crypto.randomUUID();
      requestKeys.current.set(mapKey, requestKey);
      setResolvingJobId(jobId);
      try {
        await resolveBadgePrintJob(expoId, jobId, action, requestKey);
        toast.success(
          action === 'REQUEUE'
            ? '다시 출력 대기열에 넣었습니다.'
            : '처리 완료로 닫았습니다.',
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : '출력 작업을 처리하지 못했습니다.',
        );
      } finally {
        setResolvingJobId(null);
        void queryClient.invalidateQueries({
          queryKey: badgePrintJobsQueryKey(expoId),
        });
      }
    },
    [expoId, queryClient],
  );

  return {
    data: query.data,
    isError: query.isError,
    resolve,
    resolvingJobId,
  };
};
