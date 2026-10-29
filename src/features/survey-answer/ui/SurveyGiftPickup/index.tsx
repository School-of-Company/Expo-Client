'use client';

import { useRef, useState } from 'react';
import {
  useConfirmGiftPickupMutation,
  useGiftPickupStatusQuery,
} from '@/entities/survey';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { Button } from '@/shared/ui';
import { isPickupDone } from '../../lib/giftPickup';

export const GIFT_NOTICE =
  '설문에 참여해 주셔서 감사합니다. 출구 쪽 설문부스에서 소정의 기념품을 수령해 주세요.';

/**
 * 설문 제출 뒤 기념품 수령 안내와 직원확인. 직원확인은 PIN 없이 버튼 한 번으로 서버에 완료를 저장하며,
 * 참가자가 직접 눌러도 처리된다. 완료 문구는 서버가 완료를 확정한 응답(status·confirm)으로만 보이고,
 * 요청이 실패하면 완료로 보이지 않고 다시 시도할 수 있다
 */
const SurveyGiftPickup = ({
  expoId,
  token,
  onTokenInvalid,
}: {
  expoId: string;
  token: string;
  /** 서버가 이 토큰을 모른다고 하면(다른 박람회·없는 토큰) 저장해 둔 토큰을 버리게 알린다 */
  onTokenInvalid: () => void;
}) => {
  const { data, error, isLoading, isFetching, refetch } =
    useGiftPickupStatusQuery(expoId, token);
  const confirm = useConfirmGiftPickupMutation(expoId, token);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  // 연타가 한 번의 요청만 보내도록 제출 중에는 막는다
  const inFlight = useRef(false);
  const tokenInvalid = getErrorStatus(error) === 404;

  // 기념품 수령 안내는 제출자 전원에게 보인다. 상태를 못 받았거나 아직 받는 중이어도 먼저 보여
  // 참가자가 무엇을 해야 하는지 알게 한다(완료된 뒤에만 거둔다)
  const notice = (
    <p className="break-keep text-center text-body1b text-black">
      {GIFT_NOTICE}
    </p>
  );

  const handleConfirm = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setConfirmError(null);
    try {
      await confirm.mutateAsync();
    } catch (e) {
      if (getErrorStatus(e) === 404) {
        onTokenInvalid();
        return;
      }
      // 실패하면 완료로 보이지 않는다. 같은 버튼으로 다시 시도할 수 있다
      setConfirmError(
        e instanceof Error ? e.message : '직원확인을 완료하지 못했습니다.',
      );
    } finally {
      inFlight.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full max-w-[420px] flex-col items-center gap-12 rounded-sm border-1 border-solid border-gray-200 p-24">
        {notice}
        <p role="status" className="text-caption1r text-gray-500">
          직원확인 상태를 확인하는 중입니다...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full max-w-[420px] flex-col items-center gap-12 rounded-sm border-1 border-solid border-gray-200 p-24">
        {notice}
        <p
          role="alert"
          className="break-keep text-center text-caption1r text-red-500"
        >
          {error.message}
        </p>
        {tokenInvalid ? (
          <Button variant="white" onClick={onTokenInvalid}>
            확인
          </Button>
        ) : (
          // 다시 받는 동안 버튼이 바뀌어야 눌렀다는 것을 알 수 있다
          <Button
            variant="white"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? '확인 중...' : '다시 확인하기'}
          </Button>
        )}
      </div>
    );
  }

  if (isPickupDone(data)) {
    return (
      <div
        role="status"
        className="flex w-full max-w-[420px] flex-col items-center gap-8 rounded-sm border-1 border-solid border-main-600 bg-main-100 p-24"
      >
        <p className="text-center text-h3b text-main-600">
          직원확인이 완료되었습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-16 rounded-sm border-1 border-solid border-gray-200 p-24">
      {notice}
      <p className="break-keep text-center text-caption1r text-gray-500">
        수령할 때 운영위원에게 이 화면을 보여 주고 직원확인을 눌러 주세요.
      </p>
      {confirmError && (
        <p
          role="alert"
          className="break-keep text-center text-caption1r text-red-500"
        >
          {confirmError} 다시 눌러 주세요.
        </p>
      )}
      <Button onClick={handleConfirm} disabled={confirm.isPending}>
        {confirm.isPending ? '확인 중...' : '직원확인'}
      </Button>
    </div>
  );
};

export default SurveyGiftPickup;
