import React from 'react';
import { Header } from '@/widgets/layout';
import { SignUpContainer } from '@/widgets/signUp';

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow items-center justify-center">
        <div className="mt-8 w-full max-w-[792px] px-5">
          <SignUpContainer />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
