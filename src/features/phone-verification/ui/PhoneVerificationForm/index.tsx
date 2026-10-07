'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { UseFormRegisterReturn, useForm } from 'react-hook-form';
import {
  PHONE_NUMBER_PATTERN,
  SMS_CODE_PATTERN,
} from '@/shared/config/validation';
import { useTimer } from '@/shared/model';
import { Button, Input } from '@/shared/ui';
import { getRedirectPath } from '../../lib/getRedirectPath';
import { useSendVerificationSms } from '../../model/useSendVerificationSms';
import { useVerifySmsCode } from '../../model/useVerifySmsCode';

const SMS_CODE_EXPIRY_SECONDS = 5 * 60;

interface PhoneVerificationFormValues {
  phoneNumber: string;
  code: string;
}

const formatTimer = (timer: number) =>
  `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;

const PhoneVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<PhoneVerificationFormValues>();

  const [isSmsSent, setIsSmsSent] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  useTimer(timer, setTimer, setIsSmsSent, isSmsVerified);

  const { mutate: sendSms, isPending: isSendingSms } = useSendVerificationSms(
    () => {
      setIsSmsSent(true);
      setTimer(SMS_CODE_EXPIRY_SECONDS);
    },
  );

  const { mutate: verifySmsCode, isPending: isVerifying } = useVerifySmsCode(
    (phoneNumber) => {
      setIsSmsVerified(true);
      router.replace(
        getRedirectPath(searchParams.get('redirect'), phoneNumber),
      );
    },
  );

  const handleSendSms = async () => {
    const isValid = await trigger('phoneNumber');
    if (isValid) sendSms(getValues('phoneNumber'));
  };

  const onSubmit = (data: PhoneVerificationFormValues) => {
    verifySmsCode(data);
  };

  // 버튼을 누르기 전까지는 검증 메시지를 띄우지 않고, 다시 입력하면 지운다
  const withDigitsOnly = (
    registration: UseFormRegisterReturn<keyof PhoneVerificationFormValues>,
  ) => ({
    ...registration,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      clearErrors(registration.name);
      return registration.onChange(e);
    },
  });

  return (
    <form className="space-y-[50px]" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-12 text-center">
        <p className="text-body1b text-main-600 mobile:text-body2b">
          프로그램 신청 및 QR 발급을 위한
        </p>
        <h1 className="text-h1m text-black mobile:text-h2b">
          휴대전화 본인 인증
        </h1>
        <p className="mt-8 break-keep text-body2r text-gray-500 mobile:text-caption1r">
          한 번 인증한 휴대전화 번호로 본인을 포함하여 최대 5명까지 프로그램을
          신청할 수 있습니다.
        </p>
      </div>

      <div className="space-y-20">
        <div className="space-y-8">
          <p className="text-h3b text-black mobile:text-body1b">연락처</p>
          <div className="flex gap-16 mobile:gap-8">
            <Input
              {...withDigitsOnly(
                register('phoneNumber', {
                  required: '연락처를 입력해주세요.',
                  pattern: PHONE_NUMBER_PATTERN,
                }),
              )}
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="연락처는 - 빼고 입력해주세요"
              disabled={isSmsSent || isSmsVerified}
              error={!!errors.phoneNumber}
            />
            <Button
              onClick={handleSendSms}
              width="120px"
              disabled={
                !watch('phoneNumber') ||
                isSendingSms ||
                isSmsSent ||
                isSmsVerified
              }
            >
              {isSmsVerified
                ? '인증 완료'
                : isSmsSent
                  ? formatTimer(timer)
                  : '인증 번호'}
            </Button>
          </div>
          {errors.phoneNumber && (
            <p className="text-caption1r text-error">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-8">
          <p className="text-h3b text-black mobile:text-body1b">인증 번호</p>
          <Input
            {...withDigitsOnly(
              register('code', {
                required: '인증 번호를 입력해주세요.',
                pattern: SMS_CODE_PATTERN,
              }),
            )}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="인증 번호 6자리를 입력해주세요"
            disabled={!isSmsSent || isSmsVerified}
            error={!!errors.code}
          />
          {errors.code && (
            <p className="text-caption1r text-error">{errors.code.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isSmsSent || !watch('code') || isVerifying || isSmsVerified}
      >
        {isVerifying ? '확인 중...' : '인증하기'}
      </Button>
    </form>
  );
};

export default PhoneVerificationForm;
