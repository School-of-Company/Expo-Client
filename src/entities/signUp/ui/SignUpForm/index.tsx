import React from 'react';
import { Button, Input } from '@/shared/ui';

const SignUpForm = () => {
  return (
    <div>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-h4 text-black">이름</p>
          <Input type="text" placeholder="이름을 입력해주세요." />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">이메일</p>
          <Input placeholder="이메일을 입력해주세요." type="email" />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">비밀번호</p>
          <Input
            placeholder="(8~24자 영어(대소문자)/숫자 특수문자 1개이상)"
            type="password"
          />
          <Input placeholder="비밀번호를 다시 입력해주세요." type="password" />
        </div>
        <div className="space-y-3">
          <p className="text-h4 text-black">연락처</p>
          <Input placeholder="연락처을 입력해주세요." type="text" />
        </div>
      </div>
      <div className="mt-[160px]">
        <Button text="로그인" />
      </div>
    </div>
  );
};

export default SignUpForm;
