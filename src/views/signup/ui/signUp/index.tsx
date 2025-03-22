import React from 'react';
import { Header } from '@/widgets/layout';
import { SignUpForm } from '@/widgets/signup';

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow items-center justify-center py-[30px]">
        <div className="w-full max-w-[792px] px-5 py-8">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
