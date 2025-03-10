import React from 'react';
import { SignupPrompt } from '@/entities/signin';
import Header from '@/widgets/layout/ui/Header';
import { SignInForm } from '@/widgets/signin';

const SignIn = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[792px] px-5 py-8">
          <div className="space-y-50">
            <p className="text-center text-h1">관리자 로그인</p>
            <SignInForm />
          </div>
          <SignupPrompt />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
