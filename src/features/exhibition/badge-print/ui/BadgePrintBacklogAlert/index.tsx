'use client';

import { useQuery } from '@tanstack/react-query';
import { getBadgePrintJobs } from '../../api/badgePrintApi';
import { staleWaitingCount } from '../../model/badgePrintHealth';

const REFRESH_MS = 10_000;

/** 1분 넘게 아무 출력대도 가져가지 않은 명찰이 있으면 알린다. 출력대가 모두 멈췄을 때 누락을 바로 알아채기 위해서다 */
const BadgePrintBacklogAlert = ({ expoId }: { expoId: string }) => {
  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['badgePrintWaiting', expoId],
    queryFn: () => getBadgePrintJobs(expoId, ['WAITING']),
    refetchInterval: REFRESH_MS,
    // 주기 조회라 실패 토스트가 쌓이지 않게 한다
    meta: { silent: true },
  });
  const stale = data ? staleWaitingCount(data, dataUpdatedAt) : 0;
  if (stale === 0) return null;

  return (
    <p
      role="alert"
      className="break-keep rounded-sm bg-error px-16 py-12 text-body2b text-white"
    >
      1분 넘게 출력되지 않은 명찰이 {stale}건 있습니다. 출력대 화면이 멈췄거나
      일시정지 상태인지 확인해 주세요.
    </p>
  );
};

export default BadgePrintBacklogAlert;
