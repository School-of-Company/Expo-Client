'use client';

import { useSearchParams } from 'next/navigation';
import {
  ExhibitionAccessQrContainer,
  getHeaderTitleByUserType,
} from '@/features/exhibition/access-qr';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { DetailHeader } from '@/shared/ui';

const ExhibitionAccessQrPage = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const applicationType = searchParams.get('applicationType') || 'REGISTER';

  if (!userType) {
    return <div>유저 타입이 없습니다.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-16">
      <div className="mt-30 flex w-full max-w-[816px] flex-1 flex-col overflow-y-auto">
        <DetailHeader
          headerTitle={getHeaderTitleByUserType(
            userType,
            applicationType as ApplicationType,
          )}
          textCenter={true}
        />
        <ExhibitionAccessQrContainer
          id={id}
          userType={userType}
          applicationType={applicationType}
        />
      </div>
    </div>
  );
};

export default ExhibitionAccessQrPage;
