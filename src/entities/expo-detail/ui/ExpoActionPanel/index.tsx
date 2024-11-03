import React from 'react';
import { Button, WhiteButton } from '@/shared/ui';

const ExpoActionPanel = ({ role = 'manage' }) => {
  const getButtons = () => {
    if (role === 'user') {
      return <Button text="신청하기" />;
    }
    if (role === 'manage') {
      return (
        <div className="w-full space-y-2 mobile:space-y-2">
          <div className="space-y-2 mobile:flex mobile:gap-5 mobile:space-y-0">
            <Button text="QR 조회하기" />
            <Button text="문자 보내기" />
          </div>
          <WhiteButton text="수정하기" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-fit max-w-[210px] space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px] mobile:max-w-full mobile:border-none mobile:px-[16px]">
      <p className="text-caption1 text-black mobile:hidden">
        2024 AI광주미래교육박람회
      </p>
      <div className="space-y-2">{getButtons()}</div>
    </div>
  );
};

export default ExpoActionPanel;
