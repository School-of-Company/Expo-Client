'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';

const DetailHeader = ({ HederTitle }: { HederTitle: string }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-[58px]">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft />
      </label>
      <p className="text-h1 text-black">{HederTitle}</p>
    </div>
  );
};

export default DetailHeader;
