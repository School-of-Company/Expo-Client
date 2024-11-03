'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';

const DetailHeader = ({ HederTitle }: { HederTitle: string }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-[58px] mobile:gap-[27px]">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft />
      </label>
      <p className="text-h1 text-black mobile:text-body1">{HederTitle}</p>
    </div>
  );
};

export default DetailHeader;
