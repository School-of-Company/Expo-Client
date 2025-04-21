'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NameTagHeader from '@/entities/name-tag/ui/NameTagHeader';
import { printActions } from '@/shared/model/footerActions';
import { useQRScanner } from '@/shared/model/useQRScanner';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { AttendUserResponse } from '@/shared/types/name-tag/type';
import { TableForm } from '@/shared/ui/Table';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';

const NameTagForm = ({ id }: { id: string }) => {
  const requestPrintCategories = [
    '아이디',
    '이름',
    '번호',
    '개인정보 상태',
    '참가자 상태',
  ];

  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<AttendUserResponse[]>([]);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(id);
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

    const newUser: AttendUserResponse = await attendUser({
      authority,
      phoneNumber: scannedQR.phoneNumber,
    });

    setUserData((prev) => [...prev, newUser]);
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
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
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
