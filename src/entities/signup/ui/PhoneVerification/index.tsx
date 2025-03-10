import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { SignUpData } from '@/shared/types/signup/type';
import { Button, Input } from '@/shared/ui';

interface PhoneVerificationProps {
  register: UseFormRegister<SignUpData>;
  errors: FieldErrors<SignUpData>;
  watch: UseFormWatch<SignUpData>;
  isSmsSent: boolean;
  isSmsVerified: boolean;
  isSendingSms: boolean;
  isCheckingCode: boolean;
  timer: number;
  sendSms: (phoneNumber: string) => void;
  checkSmsCode: () => void;
}

const PhoneVerification = ({
  register,
  errors,
  watch,
  isSmsSent,
  isSmsVerified,
  isSendingSms,
  isCheckingCode,
  timer,
  sendSms,
  checkSmsCode,
}: PhoneVerificationProps) => (
  <div className="space-y-8">
    <p className="text-h3b text-black">연락처</p>
    <div>
      <div className="flex space-x-16 space-y-4">
        <Input
          {...register('phoneNumber', {
            required: '연락처를 입력해주세요.',
            pattern: {
              value: /^\d{10,11}$/,
              message: '유효한 전화번호를 입력해주세요.',
            },
          })}
          type="tel"
          placeholder="연락처는 - 빼고 입력해주세요"
          width="80%"
          disabled={isSmsVerified}
          error={!!errors.phoneNumber}
        />
        <Button
          onClick={() => sendSms(watch('phoneNumber'))}
          width="20%"
          variant="white"
          disabled={
            !watch('phoneNumber') || isSendingSms || isSmsSent || isSmsVerified
          }
        >
          {isSmsVerified
            ? '인증 완료'
            : isSmsSent
              ? `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`
              : '인증 번호'}
        </Button>
      </div>
      {errors.phoneNumber && (
        <p className="text-caption1r text-error">
          {errors.phoneNumber.message}
        </p>
      )}
    </div>
    <div>
      <div className="flex space-x-16 space-y-4">
        <Input
          {...register('code', {
            required: '인증 번호를 입력해주세요.',
            pattern: {
              value: /^\d{4}$/,
              message: '4자리 숫자를 입력해주세요.',
            },
          })}
          type="text"
          placeholder="인증 번호 입력"
          width="80%"
          disabled={!isSmsSent || isSmsVerified}
          error={!!errors.code}
        />
        <Button
          onClick={() => checkSmsCode()}
          width="20%"
          disabled={!watch('code') || isSmsVerified || !isCheckingCode}
          variant="white"
          type="button"
        >
          확인
        </Button>
      </div>
      {errors.code && (
        <p className="text-caption1r text-error">{errors.code.message}</p>
      )}
    </div>
  </div>
);

export default PhoneVerification;
