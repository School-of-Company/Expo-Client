import React from 'react';
import { Museum } from '@/shared/assets/icons';

const EmptyExpoList = () => {
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <div className="flex max-h-[276px] max-w-[432px] flex-col items-center gap-[40px]">
        <Museum width="200" height="200" />
        <p className="text-h1m text-gray-400">
          아직 박람회가 등장하지 않았아요
        </p>
      </div>
    </div>
  );
};

export default EmptyExpoList;
