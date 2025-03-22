import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignUpData } from '@/shared/types/signup/type';
import { Input } from '@/shared/ui';

interface NicknameInputProps {
  register: UseFormRegister<SignUpData>;
  errors: FieldErrors<SignUpData>;
}

const NicknameInput = ({ register, errors }: NicknameInputProps) => (
  <div className="space-y-8">
    <p className="text-h3b text-black">아이디</p>
    <Input
      {...register('nickname', { required: '아이디를 입력해주세요.' })}
      type="text"
      placeholder="아이디를 입력해주세요."
      error={!!errors.nickname}
    />
    {errors.nickname && (
      <p className="text-caption1r text-error">{errors.nickname.message}</p>
    )}
  </div>
);

export default NicknameInput;
