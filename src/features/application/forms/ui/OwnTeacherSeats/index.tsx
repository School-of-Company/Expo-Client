'use client';

import { useOwnTeacherSeats } from '../../model/usePreRegister';

/**
 * 확정된 교사·예비교사 소유자에게만 보이는 해당 회차의 교사 구분 잔여석.
 * 서버가 소유자 세션으로 확인했을 때만 숫자를 주므로 없으면 아무것도 그리지 않는다.
 * 조회에 실패하면 다른 구분 숫자로 대신하지 않고 다시 시도하게 한다
 */
const OwnTeacherSeats = ({
  expoId,
  sessionId,
}: {
  expoId: string;
  sessionId: string;
}) => {
  const { data, error, isFetching, refetch } = useOwnTeacherSeats(
    expoId,
    sessionId,
  );

  if (error)
    return (
      <div role="alert" className="flex flex-col gap-8">
        <p className="text-caption1r text-error">
          교사 구분 잔여석을 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
        >
          다시 시도
        </button>
      </div>
    );

  const remaining = data?.targetSeats?.ownTeacherRemaining;
  if (remaining == null) return null;
  return (
    <p className="text-caption1r text-gray-600">
      교사·예비교사 구분 남은 자리 {remaining.toLocaleString()}명
    </p>
  );
};

export default OwnTeacherSeats;
