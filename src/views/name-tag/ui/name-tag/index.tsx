'use client';

import React, { useState, useEffect } from 'react';
import { printActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import { FilterTab } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

const NameTag = () => {
  const requestSignUpCategories = [
    '번호',
    '성명',
    '아이디',
    '이메일',
    '연락처',
  ];

  const [scannQR, setScannQR] = useState<string>('');
  const [buffer, setBuffer] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isScanning) {
        setIsScanning(true);
        setBuffer('');
      }

      if (event.key === 'Enter') {
        const cleanData = buffer.replace(/Shift/g, '');
        console.log('스캔된 QR 코드 데이터:', cleanData);

        setScannQR(cleanData);

        setBuffer('');
        setIsScanning(false);
      } else {
        setBuffer((prev) => prev + event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, isScanning]);

  console.log(scannQR);

  const printQRActions = printActions;

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
        <FilterTab />
        <TableForm
          categories={requestSignUpCategories}
          data={[]}
          maxHeight="414px"
          footerType="print"
          text="등록된 박람회"
          actions={printQRActions}
        />
      </div>
    </div>
  );
};

export default NameTag;
