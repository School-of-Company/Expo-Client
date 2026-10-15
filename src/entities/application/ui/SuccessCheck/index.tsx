'use client';

import { useSearchParams } from 'next/navigation';
import { getSuccessMessage } from '@/features/application';
import { ApplicationSuccessLogo } from '@/shared/assets/svg';

const SuccessCheck = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const formType = searchParams.get('formType');
  const status = searchParams.get('status');
  const position = searchParams.get('position');

  return (
    <div className="flex flex-col items-center gap-32">
      <ApplicationSuccessLogo className="mobile:h-[160px] mobile:w-[160px]" />
      <p className="text-center text-h1m text-main-600 mobile:text-body1b">
        {status === 'WAITING' || status === 'PROCESSING'
          ? '대기로 접수되었습니다.'
          : getSuccessMessage(userType, formType)}
      </p>
      {(status === 'WAITING' || status === 'PROCESSING') && (
        <p className="text-center text-body1r text-gray-600">
          {status === 'WAITING' && position && `대기 순번 ${position}번 · `}
          자리가 나야 확정되며, 확정되면 QR이 대표자 번호로 발송됩니다.
        </p>
      )}
    </div>
  );
};

export default SuccessCheck;
