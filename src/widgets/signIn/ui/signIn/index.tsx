import React from 'react';
import { SignInForm, SignupPrompt } from '@/entities/signin';

const SignInContainer = () => {
  return (
    <div>
      <div className="space-y-50">
        <p className="text-center text-h1">관리자 로그인</p>
        <SignInForm />
      </div>
      <SignupPrompt />
    </div>
  );
};

export default SignInContainer;
