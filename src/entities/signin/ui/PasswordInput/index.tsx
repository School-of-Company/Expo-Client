import Link from 'next/link';
import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Eye, SelectedEye } from '@/shared/assets/icons';
import { SignInData } from '@/shared/types/signin/type';
import { Input } from '@/shared/ui';

interface PasswordInputProps {
  register: UseFormRegister<SignInData>;
  errors: FieldErrors<SignInData>;
  passwordVisible: boolean;
  handlePasswordVisibilityToggle: () => void;
}

const PasswordInput = ({
  register,
  errors,
  passwordVisible,
  handlePasswordVisibilityToggle,
}: PasswordInputProps) => (
  <div className="space-y-8">
    <p className="text-h3b text-black">비밀번호</p>
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
      icon={
        passwordVisible ? (
          <SelectedEye aria-label="비밀번호 숨기기" />
        ) : (
          <Eye aria-label="비밀번호 보기" />
        )
      }
      onIconClick={handlePasswordVisibilityToggle}
    />
    <div className="flex items-center justify-between">
      {errors.password && (
        <p className="text-caption1r text-red-500">{errors.password.message}</p>
      )}
      <Link
        href="findPassword"
        className="ml-auto text-caption1b text-main-300"
      >
        비밀번호 찾기
      </Link>
    </div>
  </div>
);

export default PasswordInput;
