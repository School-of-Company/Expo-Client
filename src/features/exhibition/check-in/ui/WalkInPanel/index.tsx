'use client';

import { getErrorStatus } from '@/shared/libs/http/apiError';
import { WalkInCategory } from '@/shared/types/exhibition/check-in/entry';
import { Button, Section } from '@/shared/ui';
import { useRecordWalkIn, useWalkInCounts } from '../../model/useWalkIn';

const CATEGORIES: { value: WalkInCategory; label: string }[] = [
  { value: 'ADULT', label: '성인' },
  { value: 'STUDENT', label: '어린이·학생' },
];

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

  // 조회가 안 되면 기록도 안 되므로 버튼을 막는다
  const isUnavailable = isError && !data;

  // 퇴장 모드에서 +1 을 누르면 입장으로 잘못 세므로 버튼과 함께 요청도 막는다
  const handleAdd = (category: WalkInCategory) => {
    if (isExitMode) return;
    mutate({ category, action: 'ADD' });
  };

  return (
    <Section
      title="QR 없는 방문객 · 간편입장"
      action={
        <p className="text-caption1r text-gray-400">
          오늘 합계 {data?.total ?? 0}명
        </p>
      }
    >
      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        {CATEGORIES.map(({ value, label }) => (
          <div key={value} className="space-y-8">
            <Button
              onClick={() => handleAdd(value)}
              disabled={isExitMode || isUnavailable || isPending}
            >
              {label} +1
            </Button>
            <div className="flex items-center justify-between">
              <p className="text-body2r text-gray-500">
                오늘 {label}{' '}
                <span className="text-black">{countOf(value)}</span>명
              </p>
              <Button
                size="small"
                variant="gray"
                onClick={() => mutate({ category: value, action: 'UNDO' })}
                disabled={isUnavailable || isPending || countOf(value) === 0}
              >
                잘못 누름 1 취소
              </Button>
            </div>
          </div>
        ))}
      </div>
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
          <Button
            size="small"
            variant="white"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            다시 시도
          </Button>
        </div>
      )}
    </Section>
  );
};

export default WalkInPanel;
