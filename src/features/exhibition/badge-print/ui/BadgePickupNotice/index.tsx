'use client';

import { useBadgePickup } from '../../model/useBadgePickup';

/** 입장 완료 카드 안의 명찰 수령 위치. 입장 성공 여부와는 무관하게 안내만 바꾼다 */
const BadgePickupNotice = ({
  expoId,
  jobId,
}: {
  expoId: string;
  jobId: number;
}) => {
  const pickup = useBadgePickup(expoId, jobId);

  if (pickup.kind === 'assigned') {
    return (
      <p className="break-keep text-h2b text-main-600">
        명찰 수령: {pickup.label}
      </p>
    );
  }
  const text =
    pickup.kind === 'needsCheck'
      ? '명찰 출력 확인이 필요합니다. 출력대 담당자에게 문의해 주세요.'
      : pickup.kind === 'done'
        ? '명찰 출력이 처리 완료되었습니다. 출력대에서 수령해 주세요.'
        : pickup.kind === 'error'
          ? '출력대를 조회하지 못했습니다. 출력대에서 직접 확인해 주세요.'
          : pickup.gaveUp
            ? '출력대 배정이 늦어지고 있습니다. 출력대에서 직접 확인해 주세요.'
            : '명찰 출력대 배정 중...';
  return (
    <p className="break-keep rounded-sm bg-gray-100 px-16 py-12 text-body2r text-gray-700">
      {text}
    </p>
  );
};

export default BadgePickupNotice;
