import React from 'react';
import { OnstieQr } from '@/entities/onsite-qr';
import { Logo } from '@/shared/assets/svg';

const OnsiteQrContainer = ({
  id,
  userType,
}: {
  id: string;
  userType: string;
}) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-24">
      <Logo className="h-[114px] w-[396px] tablet:h-[80px] tablet:w-[280px]" />
      <OnstieQr id={id} userType={userType} />
    </div>
  );
};

export default OnsiteQrContainer;
