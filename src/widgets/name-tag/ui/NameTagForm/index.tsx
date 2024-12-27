'use client';

import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import NameTagHeader from '@/entities/name-tag/ui/NameTagHeader';
import { printActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

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

const NameTagForm = ({ id }: { id: string }) => {
  const requestPrintCategories = ['아이디', '이름', '번호', 'qr번호'];
  const [scannedQR, setScannedQR] = useState<TraineeData | null>(null);
  const [buffer, setBuffer] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const handleQRScan = useCallback((cleanData: string) => {
    try {
      const parsedData: TraineeData = JSON.parse(cleanData);
      setScannedQR(parsedData);
    } catch (error) {
      console.error('QR 코드 데이터 파싱 오류:', error);
    }
  }, []);

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

  const fetchUserData = useCallback(
    async (scannedQR: TraineeData) => {
      const authority = scannedQR.traineeId ? 'ROLE_TRAINEE' : 'ROLE_STANDARD';
      try {
        const response = await axios.patch(`/api/attendance/${id}`, {
          authority,
          phoneNumber: scannedQR.phoneNumber,
        });

        const responseData: UserData = {
          id: userData.length + 1,
          name: response.data.name,
          affiliation: response.data.affiliation,
          qrCode: response.data.qrCode,
        };
        setUserData((prevData) => [...prevData, responseData]);
      } catch (error) {
        console.error('QR 코드 통신 에러:', error);
      }
    },
    [userData.length],
  );

  useEffect(() => {
    if (scannedQR) {
      fetchUserData(scannedQR);
    }
  }, [scannedQR, fetchUserData]);

  const printNameTagActions = printActions(userData);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
      <NameTagHeader />
      <TableForm
        categories={requestPrintCategories}
        data={userData}
        maxHeight="414px"
        footerType="print"
        text="QR 스캔"
        actions={printNameTagActions}
      />
    </div>
  );
};

export default NameTagForm;
