'use client';

import { useQuery } from '@tanstack/react-query';
import { getBadgePrintStations } from '../../api/badgePrintApi';
import { aliveStationCount } from '../../model/badgePrintHealth';

const REFRESH_MS = 15_000;

/**
 * 입구 화면용 출력대 연결 상태. 출력대를 등록한 박람회에서만 보이고, 켜져 있는 출력대가 없으면
 * 명찰이 나오지 않는다는 것을 바로 알린다
 */
const BadgePrintStationStatus = ({ expoId }: { expoId: string }) => {
  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['badgePrintStations', expoId, 'status'],
    queryFn: () => getBadgePrintStations(expoId),
    refetchInterval: REFRESH_MS,
    meta: { silent: true },
  });
  if (!data || data.length === 0) return null;
  const alive = aliveStationCount(data, dataUpdatedAt);

  return alive > 0 ? (
    <span className="text-caption1b text-gray-600">
      연결된 출력대 {alive}대
    </span>
  ) : (
    <span role="alert" className="text-caption1b text-error">
      연결된 명찰 출력대가 없습니다. 출력대 화면이 꺼져 있으면 명찰이 나오지
      않습니다.
    </span>
  );
};

export default BadgePrintStationStatus;
