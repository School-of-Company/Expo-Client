'use client';

import {
  LEGACY_WALK_IN_CATEGORY_LABEL,
  WALK_IN_CATEGORIES,
} from '@/shared/config';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { WalkInCategory } from '@/shared/types/exhibition/check-in/entry';
import { Button } from '@/shared/ui';
import { useRecordWalkIn, useWalkInCounts } from '../../model/useWalkIn';

/** QR 없는 방문객을 개인정보 없이 구분별 인원수로만 센다 */
const WalkInPanel = ({
  expoId,
  scannerName,
  isExitMode,
}: {
  expoId: string;
  scannerName?: string;
  isExitMode: boolean;
}) => {
  const { data, error, isError, refetch, isFetching } = useWalkInCounts(expoId);
  const { mutate, isPending } = useRecordWalkIn(expoId, scannerName);

  const countOf = (category: WalkInCategory) =>
    data?.counts?.find((item) => item.category === category)?.count ?? 0;

  // 예전 구분(성인·어린이·학생)으로 쌓인 기록은 버튼 없이 안내만 한다. 합계에는 이미 들어 있다
  const legacyCounts = (data?.counts ?? []).filter(
    ({ category, count }) => category in LEGACY_WALK_IN_CATEGORY_LABEL && count,
  );

  // 조회가 안 되면 기록도 안 되므로 버튼을 막는다
  const isUnavailable = isError && !data;

  // 퇴장 모드에서 +1 을 누르면 입장으로 잘못 세므로 버튼과 함께 요청도 막는다
  const handleAdd = (category: WalkInCategory) => {
    if (isExitMode) return;
    mutate({ category, action: 'ADD' });
  };

  return (
    <section className="space-y-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex items-center justify-between gap-12">
        <p className="text-body1b text-black">QR 없는 방문객 · 간편입장</p>
        <p className="text-body2b text-main-600">
          오늘 합계 {data?.total ?? 0}명
        </p>
      </div>
      <div className="grid grid-cols-4 gap-12 mobile:grid-cols-2 tablet:grid-cols-2">
        {WALK_IN_CATEGORIES.map(({ value, label }) => (
          <div key={value} className="space-y-12 rounded-sm bg-gray-100 p-16">
            <div className="flex items-baseline justify-between gap-8">
              <p className="text-body2b text-gray-700">{label}</p>
              <p className="text-h2b text-black">
                {countOf(value)}
                <span className="text-body2r text-gray-500"> 명</span>
              </p>
            </div>
            <Button
              onClick={() => handleAdd(value)}
              disabled={isExitMode || isUnavailable || isPending}
            >
              {label} +1
            </Button>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => mutate({ category: value, action: 'UNDO' })}
                disabled={isUnavailable || isPending || countOf(value) === 0}
                className="text-caption1r text-gray-500 underline disabled:text-gray-300"
              >
                잘못 누름 1 취소
              </button>
            </div>
          </div>
        ))}
      </div>
      {legacyCounts.length > 0 && (
        <p className="break-keep text-caption1r text-gray-500">
          이전 구분 기록:{' '}
          {legacyCounts
            .map(
              ({ category, count }) =>
                `${LEGACY_WALK_IN_CATEGORY_LABEL[category]} ${count}명`,
            )
            .join(', ')}{' '}
          (합계에 포함)
        </p>
      )}
      {isExitMode && !isUnavailable && (
        <p className="break-keep text-body2r text-main-600">
          퇴장 모드에서는 간편입장 +1을 쓸 수 없습니다. 입장 모드로 바꿔 주세요.
        </p>
      )}
      {isUnavailable && (
        <div role="alert" className="flex items-center justify-between gap-12">
          <p className="break-keep text-body2r text-gray-500">
            {getErrorStatus(error) === 404
              ? '간편입장을 아직 쓸 수 없습니다. 서버 연결(Gateway 간편입장 경로)을 준비 중이거나 박람회를 찾지 못했습니다.'
              : '간편입장 집계를 불러오지 못했습니다.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 text-body2r text-main-600 underline disabled:text-gray-300"
          >
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
};

export default WalkInPanel;
