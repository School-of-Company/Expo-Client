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

import { useTimer } from '@/shared/model';
import { SignUpData } from '@/shared/types/signup/type';
import { Button, DetailHeader } from '@/shared/ui';
import { SignupError } from '../../api/postSignup';
import { useCheckSmsCode } from '../../model/useCheckSmsCode';
import { useSendSms } from '../../model/useSendSms';
import { useSignup } from '../../model/useSignup';

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SignUpData>();
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSmsVerified, setIsSmsVerified] = useState(false);

  const { mutate: signup, isPending, isSuccess } = useSignup();
  const { mutate: sendSms, isPending: isSendingSms } = useSendSms(
    setTimer,
    setIsSmsSent,
  );
  const { mutate: checkSmsCode, isPending: isCheckingCode } =
    useCheckSmsCode(setIsSmsVerified);

  useTimer(timer, setTimer, setIsSmsSent, isSmsVerified);

  const handleSendSms = async () => {
    const isValid = await trigger('phoneNumber');
    if (isValid) sendSms(getValues('phoneNumber'));
  };

  const handleCheckSmsCode = async () => {
    const isValid = await trigger('code');
    if (isValid) {
      checkSmsCode({
        phoneNumber: getValues('phoneNumber'),
        code: getValues('code'),
      });
    }
  };

  // 인증 기록이 만료됐거나 시도 횟수를 넘으면 인증 번호를 처음부터 다시 받게 한다
  const resetSmsVerification = useCallback(() => {
    setIsSmsVerified(false);
    setIsSmsSent(false);
    setTimer(0);
    setValue('code', '');
  }, [setValue]);

  const onSubmit = useCallback(
    (data: SignUpData) => {
      // 서버가 가입 때 인증 번호를 다시 확인하므로 화면에서 인증을 마친 뒤에만 보낸다
      if (!isSmsVerified) {
        setError('code', { message: '인증 번호 확인을 먼저 해주세요.' });
        return;
      }
      signup(data, {
        onError: (error) => {
          if (!(error instanceof SignupError)) return;
          if (error.status === 404 || error.status === 429) {
            resetSmsVerification();
          }
          Object.entries(error.fieldErrors ?? {}).forEach(([field, reason]) => {
            if (field in data) {
              setError(field as keyof SignUpData, { message: reason });
            }
          });
        },
      });
    },
    [signup, isSmsVerified, setError, resetSmsVerification],
  );

  return (
    <form
      className="space-y-[50px]"
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
    >
      <DetailHeader textCenter={true} headerTitle="관리자 회원가입" />
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
          sendSms={handleSendSms}
          checkSmsCode={handleCheckSmsCode}
        />
      </div>
      <div className="mt-[160px]">
        <Button disabled={isPending || isSuccess} type="submit">
          확인
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
