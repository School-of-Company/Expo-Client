import React from 'react';
import { Button } from '@/shared/ui';

const NameTagHeader = () => {
  return (
    <div className="flex justify-between">
      <p className="text-h3 text-black">참가자 명찰 인원</p>
      <div className="w-[213px]">
        <Button text="현장 QR 조회하기" />
      </div>
    </div>
  );
};

export default NameTagHeader;
