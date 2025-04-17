'use client';

import { useSearchParams } from 'next/navigation';
import { ApplicationSuccessLogo } from '@/shared/assets/svg';
import { getSuccessMessage } from '../../model/getSuccessMessage';

const SuccessCheck = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const formType = searchParams.get('formType');

  return (
    <div className="flex flex-col items-center gap-32">
      <ApplicationSuccessLogo className="mobile:h-[160px] mobile:w-[160px]" />
      <p className="text-h1m text-main-600 mobile:text-body1b">
        {getSuccessMessage(userType, formType)}
      </p>
    </div>
  );
};

export default SuccessCheck;
