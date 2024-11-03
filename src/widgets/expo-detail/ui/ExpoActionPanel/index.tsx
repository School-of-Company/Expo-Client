import React from 'react';
import WhiteButton from '@/entities/expo-detail/ui/WhiteButton';
import { Button } from '@/shared/ui';

const ExpoActionPanel = ({ role = 'manage' }) => {
  const getButtons = () => {
    if (role === 'user') {
      return <Button text="신청하기" />;
    }
    if (role === 'manage') {
      return (
        <>
          <Button text="QR 조회하기" />
          <Button text="문자 보내기" />
          <WhiteButton text="수정하기" />
        </>
      );
    }
    return null;
  };

  return (
    <div className="h-fit max-w-[210px] space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px]">
      <p className="text-caption1 text-black">2024 AI광주미래교육박람회</p>
      <div className="space-y-2">{getButtons()}</div>
    </div>
  );
};

export default ExpoActionPanel;
