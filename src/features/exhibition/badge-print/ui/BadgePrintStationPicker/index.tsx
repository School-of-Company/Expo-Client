'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  createBadgePrintStation,
  getBadgePrintStations,
} from '../../api/badgePrintApi';

const toTime = (value: string | null) =>
  value ? value.replace('T', ' ').slice(0, 19) : '사용한 적 없음';

/**
 * 출력대 등록과 선택. 노트북마다 한 번 등록하고, 열린 주소(stationId 포함)를 Chrome
 * `--kiosk-printing` 바로가기로 저장해 두면 다음부터 바로 그 출력대로 열린다
 */
const BadgePrintStationPicker = ({
  expoId,
  onSelect,
}: {
  expoId: string;
  onSelect: (stationId: string) => void;
}) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const queryKey = ['badgePrintStations', expoId];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getBadgePrintStations(expoId),
    // 실패 문구는 목록 자리에 보여 주므로 토스트를 띄우지 않는다
    meta: { silent: true },
  });
  const stations = data ?? [];

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const created = await createBadgePrintStation(expoId);
      toast.success(`${created.label}을 등록했습니다.`);
      void queryClient.invalidateQueries({ queryKey });
      onSelect(created.stationId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '출력대를 등록하지 못했습니다.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex flex-wrap items-center justify-between gap-12">
        <p className="text-body1b text-black">명찰 출력대</p>
        <button
          type="button"
          disabled={isCreating}
          onClick={() => void handleCreate()}
          className="rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white disabled:opacity-50"
        >
          이 노트북을 새 출력대로 등록
        </button>
      </div>
      <p className="break-keep text-caption1r text-gray-600">
        프린터가 연결된 노트북마다 출력대를 하나씩 등록합니다. 이미 등록한
        노트북이면 아래 목록에서 그 출력대를 다시 엽니다. 한 출력대는 한
        곳에서만 열 수 있습니다.
      </p>
      {isLoading && (
        <p className="text-caption1r text-gray-500">불러오는 중입니다.</p>
      )}
      {isError && (
        <p className="text-caption1r text-error">
          출력대 목록을 불러오지 못했습니다.
        </p>
      )}
      {stations.length > 0 && (
        <ul className="flex flex-col gap-8">
          {stations.map((station) => (
            <li
              key={station.stationId}
              className="flex flex-wrap items-center justify-between gap-12 rounded-sm bg-gray-100 px-16 py-12"
            >
              <div className="flex flex-col gap-4">
                <p className="text-body2b text-black">
                  {station.label}
                  {station.paused && (
                    <span className="ml-8 text-caption1b text-error">
                      일시정지
                    </span>
                  )}
                </p>
                <p className="text-caption1r text-gray-500">
                  마지막 연결 {toTime(station.lastSeenAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelect(station.stationId)}
                className="rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-8 text-caption1b text-gray-700"
              >
                이 출력대로 열기
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BadgePrintStationPicker;
