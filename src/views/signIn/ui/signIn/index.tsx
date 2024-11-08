import React from 'react';
import Header from '@/widgets/layout/ui/Header';
import SignInContainer from '@/widgets/signIn/ui/signIn';

const SignIn = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-[792px] px-5 py-8">
          <SignInContainer />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
