import { Suspense } from 'react';
import { PhoneVerificationForm } from '@/features/phone-verification';

const PhoneVerificationPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-[792px] p-16">
        <Suspense>
          <PhoneVerificationForm />
        </Suspense>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
