import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Eye, SelectedEye } from '@/shared/assets/icons';
import { SignUpData } from '@/shared/types/signup/type';
import { Input } from '@/shared/ui';

interface PasswordInputProps {
  register: UseFormRegister<SignUpData>;
  errors: FieldErrors<SignUpData>;
  watch: UseFormWatch<SignUpData>;
}

const PasswordInput = ({ register, errors, watch }: PasswordInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [checkPasswordVisible, setCheckPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleCheckPasswordVisibility = () => {
    setCheckPasswordVisible((prev) => !prev);
  };

  return (
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
        type={passwordVisible ? 'text' : 'password'}
        placeholder="(8자리 이상, 대문자 1개, 특수문자 1개 이상)"
        error={!!errors.password}
        icon={
          passwordVisible ? (
            <SelectedEye aria-label="비밀번호 숨기기" />
          ) : (
            <Eye aria-label="비밀번호 보기" />
          )
        }
        onIconClick={togglePasswordVisibility}
      />
      {errors.password && (
        <p className="text-caption1r text-error">{errors.password.message}</p>
      )}
      <Input
        {...register('checkPassword', {
          required: '비밀번호를 다시 입력해주세요.',
          validate: (value) =>
            value === watch('password') || '비밀번호가 일치하지 않습니다.',
        })}
        type={checkPasswordVisible ? 'text' : 'password'}
        placeholder="비밀번호를 다시 입력해주세요."
        error={!!errors.checkPassword}
        icon={
          checkPasswordVisible ? (
            <SelectedEye aria-label="비밀번호 숨기기" />
          ) : (
            <Eye aria-label="비밀번호 보기" />
          )
        }
        onIconClick={toggleCheckPasswordVisibility}
      />
      {errors.checkPassword && (
        <p className="text-caption1r text-error">
          {errors.checkPassword.message}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
