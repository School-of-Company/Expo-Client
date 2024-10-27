import React from 'react';
import SignInForm from '@/entities/signIn/ui/SignInForm';
import SignupPrompt from '@/entities/signIn/ui/SignupPrompt';

const SignInContainer = () => {
  return (
    <div>
      <div className="space-y-[50px]">
        <p className="text-center text-h1 text-black">관리자 로그인</p>
        <SignInForm />
      </div>
      <SignupPrompt />
    </div>
  );
};

export default SignInContainer;
