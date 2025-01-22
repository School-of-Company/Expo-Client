'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { Museum } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

const ExpoCreatedContainer = ({ id }: { id: string }) => {
  const router = useRouter();
  const handleButton = () => {
    router.push(`/create-form/${id}?navigation=standard`);
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[40px]">
      <Museum width="200" height="200" fill="#448FFF" />
      <p className="text-h1 text-main-600">박람회 등록되었습니다.</p>
      <Button onClick={handleButton} text="폼 생성하러 가기" style="white" />
    </div>
  );
};

export default ExpoCreatedContainer;
