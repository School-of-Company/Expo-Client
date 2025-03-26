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
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size="36" />
      </label>
      <p className="mobile:text-body1 flex-grow text-h1m text-black">
        {headerTitle}
      </p>
    </div>
  );
};

export default DetailHeader;
