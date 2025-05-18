'use client';

import React, { useState, useEffect } from 'react';

import { ExhibitionCheckInHeader } from '@/entities/exhibition';
import { useQRScanner } from '@/shared/model/useQRScanner';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { AttendUserResponse } from '@/shared/types/name-tag/type';
import { TableForm } from '@/shared/ui/Table';
import { CHECK_IN_PRINT_CATEGORIES } from '../../model/constants';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';
import { userQrPrint } from '../../model/userQrPrint';

const QRScannerTable = ({ id }: { id: string }) => {
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<AttendUserResponse[]>([]);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(id);

  useQRScanner(setScannedQR);

  const fetchUserData = async (scannedQR: QrScanData) => {
    const authority = scannedQR.traineeId ? 'ROLE_TRAINEE' : 'ROLE_STANDARD';
    const newUser: AttendUserResponse = await attendUser({
      authority,
      phoneNumber: scannedQR.phoneNumber,
    });
    setUserData((prev) => [...prev, newUser]);
  };

  useEffect(() => {
    if (!scannedQR) return;
    const handleScan = async () => {
      await fetchUserData(scannedQR);
      setScannedQR(null);
    };
    handleScan();
  }, [scannedQR]);

  const userQrPrintActions = {
    PrintBadge: (selectItem: number) => userQrPrint(userData, selectItem),
  };

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
      <ExhibitionCheckInHeader />
      <TableForm
        categories={CHECK_IN_PRINT_CATEGORIES}
        data={userData}
        maxHeight="414px"
        footerType="print"
        text="QR 스캔"
        actions={userQrPrintActions}
      />
    </div>
  );
};

export default QRScannerTable;
