'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useGiftPinQuery, useSetGiftPinMutation } from '@/entities/survey';
import { withLoading } from '@/shared/hocs';
import { Button, Input } from '@/shared/ui';

// 직원 PIN은 숫자 4~8자리다(Expo-Form-Server 계약)
const PIN_PATTERN = /^\d{4,8}$/;

/**
 * 박람회 직원 PIN 설정·변경. 설문 제출자의 기념품 수령을 운영위원이 확인할 때 쓰는 PIN이다.
 * 기존 PIN 원문은 서버가 주지 않아 보여 줄 수 없고, 설정 여부만 보인다. 경품 추첨 설정과는 별개다
 */
const GiftPinSettings = ({ expoId }: { expoId: string }) => {
  const { data, isLoading, error } = useGiftPinQuery(expoId);
  const { mutate, isPending } = useSetGiftPinMutation(expoId);
  const [pin, setPin] = useState('');
  const isValid = PIN_PATTERN.test(pin);

  const handleSave = () => {
    if (!isValid || isPending) return;
    if (
      data?.configured &&
      !window.confirm(
        '직원 PIN을 바꿀까요? 바꾸면 이전 PIN으로는 기념품 수령을 확인할 수 없습니다.',
      )
    )
      return;
    mutate(pin, {
      onSuccess: () => {
        setPin('');
        toast.success('직원 PIN을 저장했습니다.');
      },
      // 저장 실패와 성공을 구분해 알린다. 실패하면 입력한 PIN은 그대로 둔다
      onError: (saveError) => toast.error(saveError.message),
    });
  };

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message}
      </div>
    );
  }

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-col gap-36">
        <div className="space-y-8">
          <p className="text-h2b text-black">기념품 수령 직원 PIN</p>
          <p className="break-keep text-body2r text-gray-500">
            참가자가 만족도 조사를 제출하면 출구 설문부스에서 기념품을 받도록
            안내합니다. 운영위원이 참가자 휴대전화에서 직원확인을 누르고 이
            PIN을 입력하면 기념품 수령이 완료로 기록됩니다. 경품 추첨 설정과는
            별개이고, 당첨 여부와 상관없이 설문을 제출한 모든 참가자에게
            적용됩니다.
          </p>
        </div>

        <section className="space-y-12">
          <p className="text-h4b text-black">현재 상태</p>
          <p
            className={`text-h3b ${data?.configured ? 'text-main-600' : 'text-red-500'}`}
          >
            {data?.configured ? 'PIN 설정됨' : 'PIN 미설정'}
          </p>
          <p className="break-keep text-caption1r text-gray-400">
            {data?.configured
              ? '보안을 위해 설정한 PIN은 다시 볼 수 없습니다. 잊었다면 새 PIN으로 바꿔 주세요.'
              : 'PIN이 없으면 참가자의 수령 확인을 할 수 없습니다. 행사 전에 설정해 주세요.'}
          </p>
        </section>

        <section className="space-y-12">
          <p className="text-h4b text-black">
            {data?.configured ? '새 PIN으로 바꾸기' : 'PIN 설정'}
          </p>
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            aria-label="직원 PIN"
            placeholder="숫자 4~8자리"
            maxLength={8}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
          />
          <p
            className={`break-keep text-caption1r ${pin && !isValid ? 'text-red-500' : 'text-gray-400'}`}
          >
            숫자 4~8자리로 정합니다. 운영위원에게만 알려 주세요.
          </p>
        </section>

        <Button onClick={handleSave} disabled={!isValid || isPending}>
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    ),
  });
};

export default GiftPinSettings;
