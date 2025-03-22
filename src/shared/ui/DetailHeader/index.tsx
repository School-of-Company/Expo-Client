'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';

interface Props {
  headerTitle: string;
}

const DetailHeader = ({ headerTitle }: Props) => {
  const router = useRouter();

  return (
    <div className="relative flex h-[60px] items-center justify-between">
      <label
        className="absolute left-0 hover:cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft />
      </label>
      <p className="mobile:text-body1 flex-grow text-center text-h1m text-black">
        {headerTitle}
      </p>
    </div>
  );
};

export default DetailHeader;
