'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';

interface Props {
  headerTitle: string;
  textCenter?: boolean;
}

const DetailHeader = ({ headerTitle, textCenter = false }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-24">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size="32" />
      </label>
      <p
        className={`flex-grow text-h2r text-black mobile:text-body1r ${
          textCenter ? 'text-center' : ''
        }`}
      >
        {headerTitle}
      </p>
    </div>
  );
};

export default DetailHeader;
