'use client';

import { SignupPrompt } from '@/entities/signin';
import { SignInForm } from '@/features/auth/signin';

const SignIn = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[792px] px-5 py-8">
        <div className="space-y-50">
          <p className="text-center text-h1m">관리자 로그인</p>
          <SignInForm />
        </div>
        <SignupPrompt />
      </div>
    </div>
  );
};

export default SignIn;
