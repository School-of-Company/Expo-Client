import React from 'react';
import { SignUpForm } from '@/entities/signUp';

const SignUpContainer = () => {
  return (
    <div>
      <div className="space-y-[50px]">
        <p className="text-center text-h1 text-black">관리자 회원가입</p>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpContainer;
