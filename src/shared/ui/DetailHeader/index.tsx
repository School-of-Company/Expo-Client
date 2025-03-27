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
    <div className="flex items-center justify-between gap-1.5">
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
