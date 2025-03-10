'use client';

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  EmailInput,
  NameInput,
  NicknameInput,
  PasswordInput,
  PhoneVerification,
} from '@/entities/signup';
import { SignUpData } from '@/shared/types/signup/type';
import { Button } from '@/shared/ui';
import DetailHeader from '@/shared/ui/DetailHeader';
import { useCheckSmsCode } from '../../model/useCheckSmsCode';
import { useSendSms } from '../../model/useSendSms';
import { useSignup } from '../../model/useSignup';
import { useTimer } from '../../model/useTimer';

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>();
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSmsVerified, setIsSmsVerified] = useState(false);

  const { mutate: signup } = useSignup();
  const { mutate: sendSms, isPending: isSendingSms } = useSendSms(
    setTimer,
    setIsSmsSent,
  );

  const { refetch: checkSmsCode, isPending: isCheckingCode } = useCheckSmsCode(
    watch('phoneNumber'),
    watch('code'),
    setIsSmsVerified,
  );

  useTimer(timer, setTimer, setIsSmsSent, isSmsVerified);

  const onSubmit = useCallback(
    (data: SignUpData) => {
      signup(data);
    },
    [signup],
  );

  return (
    <form className="space-y-[50px]" onSubmit={handleSubmit(onSubmit)}>
      <DetailHeader headerTitle="관리자 회원가입" />
      <div className="space-y-20">
        <NameInput register={register} errors={errors} />
        <NicknameInput register={register} errors={errors} />
        <EmailInput register={register} errors={errors} />
        <PasswordInput register={register} errors={errors} watch={watch} />
        <PhoneVerification
          register={register}
          errors={errors}
          watch={watch}
          isSmsSent={isSmsSent}
          isSmsVerified={isSmsVerified}
          isSendingSms={isSendingSms}
          isCheckingCode={isCheckingCode}
          timer={timer}
          sendSms={sendSms}
          checkSmsCode={checkSmsCode}
        />
      </div>
      <div className="mt-[160px]">
        <Button disabled={isSubmitting} type="submit">
          확인
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
