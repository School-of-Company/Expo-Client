'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button, Input } from '@/shared/ui';

type FormData = {
  name: string;
  nickname: string;
  email: string;
  password: string;
  checkPassword: string;
  phoneNumber: string;
};

const SignUpForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post('/api/auth/signup', {
        name: data.name,
        nickname: data.nickname,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });
      if (response.status === 200) {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Signup failed', error);
      toast.error('회원가입에 실패했습니다.');
    }
  };

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        const firstError = Object.values(errors)[0];
        if (firstError && firstError.message) {
          showErrorToast(firstError.message as string);
        }
      })}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-h4 text-black">이름</p>
          <Input
            {...register('name', { required: '이름을 입력해주세요.' })}
            type="text"
            placeholder="이름을 입력해주세요."
          />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">아이디</p>
          <Input
            {...register('nickname', { required: '아이디를 입력해주세요.' })}
            type="text"
            placeholder="아이디를 입력해주세요."
          />
        </div>
        <div className="space-y-3">
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
          />
        </div>
        <div className="space-y-3">
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
            type="password"
            placeholder="(8자리 이상, 대문자 1개, 특수문자 1개 이상)"
          />
          <Input
            {...register('checkPassword', {
              required: '비밀번호를 다시 입력해주세요.',
              validate: (value) =>
                value === watch('password') || '비밀번호가 일치하지 않습니다.',
            })}
            type="password"
            placeholder="비밀번호를 다시 입력해주세요."
          />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">연락처</p>
          <Input
            {...register('phoneNumber', {
              required: '연락처를 입력해주세요.',
              pattern: {
                value: /^\d{10,11}$/,
                message: '유효한 전화번호를 입력해주세요.',
              },
            })}
            type="tel"
            placeholder="연락처를 입력해주세요."
          />
        </div>
      </div>
      <div className="mt-[160px]">
        <Button disabled={isSubmitting} type="submit" text="회원가입" />
      </div>
    </form>
  );
};

export default SignUpForm;
