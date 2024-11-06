'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input } from '@/shared/ui';

const SignUpForm = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [checkPassword, setCheckPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        '비밀번호는 8자리 이상, 대문자 1개, 특수문자 1개 이상을 포함해야 합니다.';
    }

    if (password !== checkPassword) {
      newErrors.checkPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = '연락처를 입력해주세요.';
    } else if (!/^\d{10,11}$/.test(phoneNumber.replace(/-/g, ''))) {
      newErrors.phoneNumber = '유효한 전화번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      toast.success('로그인 되었습니다.');
    } else {
      toast.error('양식을 올바르게 작성해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-h4 text-black">이름</p>
          <Input
            value={name}
            setValue={setName}
            type="text"
            placeholder="이름을 입력해주세요."
            error={errors.name}
          />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">이메일</p>
          <Input
            value={email}
            setValue={setEmail}
            placeholder="이메일을 입력해주세요."
            type="email"
            error={errors.email}
          />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">비밀번호</p>
          <Input
            value={password}
            setValue={setPassword}
            placeholder="(8자리 이상, 대문자 1개, 특수문자 1개 이상)"
            type="password"
            error={errors.password}
          />
          <Input
            value={checkPassword}
            setValue={setCheckPassword}
            placeholder="비밀번호를 다시 입력해주세요."
            type="password"
            error={errors.checkPassword}
          />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">연락처</p>
          <Input
            value={phoneNumber}
            setValue={setPhoneNumber}
            placeholder="연락처를 입력해주세요."
            type="tel"
            error={errors.phoneNumber}
          />
        </div>
      </div>
      <div className="mt-[160px]">
        <Button type="submit" text="회원가입" />
      </div>
    </form>
  );
};

export default SignUpForm;
