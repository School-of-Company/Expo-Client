'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GiftPickupError,
  useConfirmGiftPickupMutation,
  useGiftPickupStatusQuery,
} from '@/entities/survey';
import { useModalDialog } from '@/shared/model';
import { Button, Input } from '@/shared/ui';
import {
  isValidStaffPin,
  keepDigits,
  remainingLockSeconds,
  toPinFailureNotice,
  type PinFailureNotice,
} from '../../lib/giftPickup';

export const GIFT_NOTICE =
  '설문에 참여해 주셔서 감사합니다. 출구 쪽 설문부스에서 소정의 기념품을 수령해 주세요.';

/** 직원이 참가자 휴대전화에서 PIN을 입력하는 창. PIN은 이 창의 상태에만 있고 저장하지 않는다 */
const StaffPinDialog = ({
  expoId,
  token,
  onClose,
  onTokenInvalid,
}: {
  expoId: string;
  token: string;
  onClose: () => void;
  onTokenInvalid: () => void;
}) => {
  const dialogRef = useModalDialog({ onClose });
  const { mutateAsync, isPending } = useConfirmGiftPickupMutation(
    expoId,
    token,
  );
  const [pin, setPin] = useState('');
  const [notice, setNotice] = useState<PinFailureNotice | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // 연타가 한 번의 요청만 보내도록 제출 중에는 막는다
  const inFlight = useRef(false);

  // 잠겨 있는 동안 1초마다 남은 시간을 다시 계산한다
  useEffect(() => {
    if (lockedUntil === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const lockSeconds = remainingLockSeconds(lockedUntil, now);
  const isLocked = lockSeconds > 0;
  const canSubmit = isValidStaffPin(pin) && !isPending && !isLocked;

  const submit = async () => {
    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setNotice(null);
    try {
      await mutateAsync(pin);
      // 서버가 완료를 확정해 캐시가 바뀌었으므로 창만 닫는다. 완료 표시는 서버 상태에서 나온다
      onClose();
    } catch (error) {
      const failure =
        error instanceof GiftPickupError
          ? error
          : {
              message:
                error instanceof Error
                  ? error.message
                  : '수령을 확인하지 못했습니다.',
            };
      const next = toPinFailureNotice({
        status: 'status' in failure ? failure.status : undefined,
        code: 'code' in failure ? failure.code : undefined,
        message: failure.message,
        attemptsLeft:
          'attemptsLeft' in failure ? failure.attemptsLeft : undefined,
        retryAfterSeconds:
          'retryAfterSeconds' in failure
            ? failure.retryAfterSeconds
            : undefined,
      });
      if (next.kind === 'LOCKED') {
        setNow(Date.now());
        setLockedUntil(Date.now() + next.retryAfterSeconds * 1000);
      }
      if (next.kind === 'TOKEN_INVALID') {
        onTokenInvalid();
        return;
      }
      setNotice(next);
      // 틀린 PIN이 입력칸에 남지 않게 비운다
      setPin('');
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="직원 PIN 입력"
        tabIndex={-1}
        className="flex w-full max-w-[360px] flex-col rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          className="flex flex-col gap-16"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <p className="text-h3b text-black">직원 확인</p>
          <p className="break-keep text-body2r text-gray-500">
            운영위원이 직원 PIN을 입력하면 기념품 수령이 완료로 기록됩니다.
            참가자는 입력하지 마세요.
          </p>
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            aria-label="직원 PIN"
            placeholder="직원 PIN (숫자 4~8자리)"
            value={pin}
            onChange={(event) => setPin(keepDigits(event.target.value))}
            disabled={isPending || isLocked}
            error={notice?.kind === 'WRONG'}
          />
          {isLocked ? (
            <p role="alert" className="break-keep text-caption1r text-red-500">
              PIN을 여러 번 틀려 잠겼습니다. {lockSeconds}초 뒤 다시 입력해
              주세요.
            </p>
          ) : (
            // 잠금 안내는 남은 시간이 있을 때만 보인다. 풀린 뒤에는 낡은 초를 남기지 않는다
            notice &&
            notice.kind !== 'LOCKED' && (
              <p
                role="alert"
                className="break-keep text-caption1r text-red-500"
              >
                {notice.text}
              </p>
            )
          )}
          <div className="flex gap-8">
            <Button type="button" variant="white" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isPending ? '확인 중...' : '확인'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 설문 제출 뒤 기념품 수령 안내와 직원 확인. 수령 완료는 서버가 확정한 상태(status)로만 보이고,
 * 이 화면에서 버튼을 눌렀다고 완료로 바꾸지 않는다
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
  const { data, error, isLoading, refetch } = useGiftPickupStatusQuery(
    expoId,
    token,
  );
  const [isPinOpen, setIsPinOpen] = useState(false);
  const tokenInvalid =
    error instanceof GiftPickupError &&
    error.code === 'GIFT_PICKUP_TOKEN_INVALID';

  if (isLoading) {
    return (
      <p role="status" className="text-body2r text-gray-500">
        기념품 수령 상태를 확인하는 중입니다...
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex w-full max-w-[420px] flex-col items-center gap-12 rounded-sm border-1 border-solid border-gray-200 p-20"
      >
        <p className="break-keep text-center text-body2r text-gray-600">
          {error.message}
        </p>
        {tokenInvalid ? (
          <Button variant="white" onClick={onTokenInvalid}>
            확인
          </Button>
        ) : (
          <Button variant="white" onClick={() => refetch()}>
            다시 확인하기
          </Button>
        )}
      </div>
    );
  }

  if (data?.claimed) {
    return (
      <div
        role="status"
        className="flex w-full max-w-[420px] flex-col items-center gap-8 rounded-sm border-1 border-solid border-main-600 bg-main-100 p-24"
      >
        <p className="text-center text-h3b text-main-600">기념품 수령 완료</p>
        <p className="break-keep text-center text-body2r text-gray-500">
          운영진 확인이 끝났습니다. 감사합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-16 rounded-sm border-1 border-solid border-gray-200 p-24">
      <p className="break-keep text-center text-body1b text-black">
        {GIFT_NOTICE}
      </p>
      <p className="break-keep text-center text-caption1r text-gray-500">
        수령할 때 운영위원에게 이 화면을 보여 주세요. 직원 확인은 운영위원이
        합니다.
      </p>
      {data && !data.pinConfigured && (
        <p
          role="status"
          className="break-keep text-center text-caption1r text-red-500"
        >
          이 박람회에 직원 PIN이 아직 설정되지 않아 지금은 확인할 수 없습니다.
          운영진에게 알려 주세요.
        </p>
      )}
      <Button
        onClick={() => setIsPinOpen(true)}
        disabled={!!data && !data.pinConfigured}
      >
        직원확인
      </Button>
      {isPinOpen && (
        <StaffPinDialog
          expoId={expoId}
          token={token}
          onClose={() => setIsPinOpen(false)}
          onTokenInvalid={() => {
            setIsPinOpen(false);
            onTokenInvalid();
          }}
        />
      )}
    </div>
  );
};

export default SurveyGiftPickup;
