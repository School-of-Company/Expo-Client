'use client';

import { useSearchParams } from 'next/navigation';
import { DetailHeader } from '@/shared/ui';
import OnsiteQrContainer from '@/widgets/onsite-qr/ui/OnsiteQrContainer';
import { getHeaderTitleByUserType } from '../../model/headerTitle';

const OnsiteQrPage = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');

  if (!userType) {
    return <div>유저 타입이 없습니다.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-16">
      <div className="mt-30 flex w-full max-w-[816px] flex-1 flex-col overflow-auto">
        <DetailHeader
          headerTitle={getHeaderTitleByUserType(userType)}
          textCenter={true}
        />
        <OnsiteQrContainer id={id} userType={userType} />
      </div>
    </div>
  );
};

export default OnsiteQrPage;
