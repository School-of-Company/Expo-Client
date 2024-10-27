import React from 'react';
import { Header } from '@/widgets/layout';
import { SignUpContainer } from '@/widgets/signUp';

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-[792px]">
          <SignUpContainer />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
