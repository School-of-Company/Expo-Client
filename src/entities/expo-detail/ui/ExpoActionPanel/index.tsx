import React from 'react';
import { Button } from '@/shared/ui';

const ExpoActionPanel = () => {
  return (
    <div className="h-fit space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px]">
      <p className="text-blak text-caption1">2024 AI광주미래교육박람회</p>
      <div className="space-y-2">
        <Button text="신청하기" />
        <Button text="신청하기" />
        <Button text="신청하기" />
      </div>
    </div>
  );
};

export default ExpoActionPanel;
