'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NameTagHeader from '@/entities/name-tag/ui/NameTagHeader';
import { printActions, UserData } from '@/shared/model/footerActions';
import { useQRScanner } from '@/shared/model/useQRScanner';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { TableForm } from '@/shared/ui/Table';

const NameTagForm = ({ id }: { id: string }) => {
  const requestPrintCategories = ['아이디', '이름', '번호', '개인정보 상태'];

  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<UserData[]>([]);

  useQRScanner(setScannedQR);

  const fetchUserData = async (scannedQR: QrScanData) => {
    const authority = scannedQR.traineeId ? 'ROLE_TRAINEE' : 'ROLE_STANDARD';

    const alreadyExists = userData.some(
      (user) => user.phoneNumber === scannedQR.phoneNumber,
    );
    if (alreadyExists) {
      toast.info('이미 스캔된 사용자입니다.');
      return;
    }

    try {
      const response = await axios.patch(`/api/server/token/attendance/${id}`, {
        authority,
        phoneNumber: scannedQR.phoneNumber,
      });

      const responseData: UserData = {
        id: userData.length + 1,
        name: response.data.name,
        phoneNumber: response.data.phoneNumber,
        personalInformationStatus: response.data.personalInformationStatus
          ? '동의'
          : '미동의',
      };

      setUserData((prevData) => [...prevData, responseData]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'QR코드 데이터 불러오기 실패');
      } else {
        toast.error('요청 실패');
      }
    }
  };

  useEffect(() => {
    if (scannedQR) {
      const handleScan = async () => {
        await fetchUserData(scannedQR);
        setScannedQR(null);
      };

      handleScan();
    }
  }, [scannedQR]);

  const printNameTagActions = printActions(userData);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
      <NameTagHeader params={id} />
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
