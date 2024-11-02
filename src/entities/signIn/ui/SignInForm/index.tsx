'use client';

import React, { useState } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

const SignInForm = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  return (
    <div>
      <div className="space-y-6">
        <p className="text-h4 text-black">이메일</p>
        <Input
          value={email}
          setValue={setEmail}
          type="text"
          placeholder="이메일을 입력해주세요."
        />
        <p className="text-h4 text-black">비밀번호</p>
        <Input
          value={password}
          setValue={setPassword}
          placeholder="비밀번호를 입력해주세요."
          type="password"
        />
      </div>
      <div className="mt-[160px]">
        <Button text="로그인" />
      </div>
    </div>
  );
};

export default SignInForm;
