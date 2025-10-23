'use client';

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IdInput, PasswordInput } from '@/entities/signin';
import { SignInData } from '@/shared/types/signin/type';
import Button from '@/shared/ui/Button';
import { useSignin } from '../../model/useSignin';

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>();
  const { mutate: signin, isPending, isSuccess } = useSignin();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handlePasswordVisibilityToggle = useCallback(
    () => setPasswordVisible((prev) => !prev),
    [],
  );

  const onSubmit = useCallback(
    (data: SignInData) => {
      signin(data);
    },
    [signin],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST" action="#">
      <div className="space-y-20">
        <IdInput register={register} errors={errors} />
        <PasswordInput
          register={register}
          errors={errors}
          passwordVisible={passwordVisible}
          handlePasswordVisibilityToggle={handlePasswordVisibilityToggle}
        />
      </div>
      <div className="mt-100">
        <Button disabled={isPending || isSuccess} type="submit">
          로그인
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
