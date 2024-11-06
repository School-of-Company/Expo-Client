'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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
  code: string;
};

const SignUpForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>();
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Toast 메시지 공통 함수
  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // 타이머 설정 및 초기화
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else {
      setIsSmsSent(false);
    }
  }, [timer]);

  // 회원가입 처리 함수
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
        showToast('success', '회원가입이 완료되었습니다.');
        router.push('/signin');
      }
    } catch (error) {
      console.error('Signup failed', error);
      showToast('error', '회원가입에 실패했습니다.');
    }
  };

  // 인증번호 발송 처리 함수
  const handlePostCode = async () => {
    const phoneNumber = watch('phoneNumber');
    if (!phoneNumber) {
      showToast('error', '전화번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/sms', { phoneNumber });
      if (response.status === 200) {
        setIsSmsSent(true);
        setTimer(180);
        showToast('success', '인증번호가 발송되었습니다.');
      }
    } catch (error) {
      console.error('SMS sending failed', error);
      showToast('error', '인증번호 발송에 실패했습니다.');
    }
  };

  // 인증번호 확인 처리 함수
  const handleCheckCode = async () => {
    const phoneNumber = watch('phoneNumber');
    const code = watch('code');
    if (!phoneNumber || !code) {
      showToast('error', '전화번호와 인증 번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get(
        `/api/auth/sms?phoneNumber=${phoneNumber}&code=${code}`,
      );
      if (response.status === 200) {
        showToast('success', '인증번호가 확인되었습니다.');
      }
    } catch (error) {
      console.error('Code verification failed', error);
      showToast('error', '인증번호 확인에 실패했습니다.');
    }
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
            placeholder="연락처는 - 빼고 입력해주세요"
          />
          <div className="flex space-x-3">
            <Input
              {...register('code', {
                required: '인증 번호를 입력해주세요.',
                pattern: {
                  value: /^\d{4}$/,
                  message: '6자리 숫자를 입력해주세요.',
                },
              })}
              type="text"
              placeholder="인증 번호 입력"
              style={{ width: '80%' }}
              disabled={!isSmsSent}
            />
            <Button
              onClick={handleCheckCode}
              text="확인"
              width="20%"
              disabled={!isSmsSent}
              type="button"
            />
          </div>
          <button
            type="button"
            onClick={handlePostCode}
            className="text-caption2 text-gray-300"
            disabled={isSmsSent}
          >
            {isSmsSent
              ? `인증번호 재발송 (${Math.floor(timer / 60)}:${String(
                  timer % 60,
                ).padStart(2, '0')})`
              : '인증번호 발송'}
          </button>
        </div>
      </div>
      <div className="mt-[160px]">
        <Button disabled={isSubmitting} type="submit" text="회원가입" />
      </div>
    </form>
  );
};

export default SignUpForm;
