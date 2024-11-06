'use client';

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

const SignInForm = () => {
  return (
    <div>
      <div className="space-y-6">
        <p className="text-h4 text-black">이메일</p>
        <Input type="text" placeholder="이메일을 입력해주세요." />
        <p className="text-h4 text-black">비밀번호</p>
        <Input placeholder="비밀번호를 입력해주세요." type="password" />
      </div>
      <div className="mt-[160px]">
        <Button text="로그인" />
      </div>
    </div>
  );
};

export default SignInForm;
