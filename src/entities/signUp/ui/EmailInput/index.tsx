import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignUpData } from '@/shared/types/signup/type';
import { Input } from '@/shared/ui';

interface EmailInputProps {
  register: UseFormRegister<SignUpData>;
  errors: FieldErrors<SignUpData>;
}

const EmailInput = ({ register, errors }: EmailInputProps) => (
  <div className="space-y-8">
    <p className="text-h4 text-black">이메일</p>
    <Input
      {...register('email', {
        required: '이메일을 입력해주세요.',
        pattern: {
          value: /\S+@\S+\.\S+/,
          message: '유효한 이메일 주소를 입력해주세요.',
        },
      })}
      type="email"
      placeholder="이메일을 입력해주세요."
      error={!!errors.email}
    />
    {errors.email && (
      <p className="text-caption2 text-error">{errors.email.message}</p>
    )}
  </div>
);

export default EmailInput;
