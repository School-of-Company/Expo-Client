'use client';

import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { printActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import { FilterTab } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

interface TraineeData {
  traineeId: number;
  phoneNumber: string;
}

interface UserData {
  id: number;
  name: string;
  affiliation: string;
  qrCode: string;
}

const NameTag = () => {
  const requestSignUpCategories = ['이름', '번호', 'qr번호'];
  const [scannedQR, setScannedQR] = useState<TraineeData | null>(null);
  const [buffer, setBuffer] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);

  // QR 코드 처리 함수
  const handleQRScan = useCallback((cleanData: string) => {
    try {
      const parsedData: TraineeData = JSON.parse(cleanData);
      setScannedQR(parsedData);
    } catch (error) {
      console.error('QR 코드 데이터 파싱 오류:', error);
    }
  }, []);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isScanning) {
        setIsScanning(true);
        setBuffer('');
      }

      if (event.key === 'Enter') {
        const cleanData = buffer.replace(/Shift/g, '');
        handleQRScan(cleanData);
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
  }, [buffer, isScanning, handleQRScan]);

  const fetchUserData = useCallback(async (scannedQR: TraineeData) => {
    const authority = scannedQR.traineeId ? 'ROLE_TRAINEE' : 'ROLE_STANDARD';
    try {
      const response = await axios.patch('/api/attendance', {
        authority,
        phoneNumber: scannedQR.phoneNumber,
      });
      const responseData: UserData = {
        id: response.data.id,
        name: response.data.name,
        affiliation: response.data.affiliation,
        qrCode: response.data.qrCode,
      };
      setUserData((prevData) => [...prevData, responseData]);
    } catch (error) {
      console.error('QR 코드 통신 에러:', error);
    }
  }, []);

  useEffect(() => {
    if (scannedQR) {
      fetchUserData(scannedQR);
    }
  }, [scannedQR, fetchUserData]);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
        <FilterTab />
        <TableForm
          categories={requestSignUpCategories}
          data={userData}
          maxHeight="414px"
          footerType="print"
          text="등록된 박람회"
          actions={printActions}
        />
      </div>
    </div>
  );
};

export default NameTag;
