'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, SelectedEye } from '@/shared/assets/icons';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useSignin } from '../../model/useSignin';

type FormData = {
  nickname: string;
  password: string;
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { mutate: signin, isPending, isSuccess } = useSignin();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const handlePasswordVisibilityToggle = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit((data) => signin(data))}>
      <div className="space-y-20">
        <div className="space-y-8">
          <p className="text-h4 text-black">아이디</p>
          <Input
            {...register('nickname', { required: '아이디를 입력해주세요.' })}
            type="text"
            placeholder="아이디를 입력해주세요."
            error={!!errors.nickname}
          />
          {errors.nickname && (
            <p className="text-caption2 text-error">
              {errors.nickname.message}
            </p>
          )}
        </div>
        <div className="space-y-8">
          <p className="text-h4 text-black">비밀번호</p>
          <Input
            {...register('password', {
              required: '비밀번호를 입력해주세요.',
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
                message:
                  '비밀번호는 8자리 이상, 대문자 1개, 특수문자 1개 이상을 포함해야 합니다.',
              },
            })}
            placeholder="비밀번호를 입력해주세요."
            type={passwordVisible ? 'text' : 'password'}
            error={!!errors.password}
            icon={passwordVisible ? <SelectedEye /> : <Eye />}
            onIconClick={handlePasswordVisibilityToggle}
          />
          <div className="flex items-center justify-between">
            {errors.password && (
              <p className="text-caption2 text-red-500">
                {errors.password.message}
              </p>
            )}
            <Link
              href="findPassword"
              className="ml-auto text-caption2 text-main-300"
            >
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-100">
        <Button disabled={isPending || isSuccess} type="submit" text="로그인" />
      </div>
    </form>
  );
};

export default SignInForm;
