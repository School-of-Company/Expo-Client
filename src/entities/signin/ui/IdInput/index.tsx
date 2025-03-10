import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignInData } from '@/shared/types/signin/type';
import { Input } from '@/shared/ui';

interface IdInputProps {
  register: UseFormRegister<SignInData>;
  errors: FieldErrors<SignInData>;
}

const IdInput = ({ register, errors }: IdInputProps) => (
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

export default IdInput;
