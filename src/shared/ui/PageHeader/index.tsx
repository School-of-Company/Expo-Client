'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';
import { preventEvent } from '@/shared/model/preventEvent';

const PageHeader = ({ title }: { title: string }) => {
  const router = useRouter();

  const handleGoBack = (e: React.MouseEvent) => {
    preventEvent(e);
    router.back();
  };

  return (
    <div className="relative flex w-full items-center justify-between py-3 mobile:px-5">
      <button type="button" onClick={handleGoBack} className="cursor-pointer">
        <ArrowLeft />
      </button>
      <p className="w-full text-center text-h3 text-black">{title}</p>
    </div>
  );
};

export default PageHeader;
