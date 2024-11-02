import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from '@/shared/assets/icons';

const DetailHeader = ({ HederTitle }: { HederTitle: string }) => {
  const router = useRouter();

  return (
    <div className="gap-58px flex">
      <label onClick={() => router.back()}>
        <ArrowLeft />
      </label>
      <p className="text-h1 text-black">{HederTitle}</p>
    </div>
  );
};

export default DetailHeader;
