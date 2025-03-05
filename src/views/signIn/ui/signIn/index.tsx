import React from 'react';
import Header from '@/widgets/layout/ui/Header';
import SignInContainer from '@/widgets/signin/ui/signIn';

const SignIn = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[792px] px-5 py-8">
          <SignInContainer />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
