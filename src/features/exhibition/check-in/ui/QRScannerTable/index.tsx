'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ExhibitionCheckInHeader } from '@/entities/exhibition';
import { toRoleAuthority, USER_AUTHORITY } from '@/shared/config';
import { useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/exhibition/check-in/type';
import { TableForm } from '@/shared/ui/Table';
import { CHECK_IN_PRINT_CATEGORIES } from '../../model/constants';
import { usePaperQrAttendanceMutation } from '../../model/usePaperQrAttendanceMutation';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';
import { userQrPrint } from '../../model/userQrPrint';

const QRScannerTable = ({ id }: { id: string }) => {
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<AttendUserResponse[]>([]);
  const [paperQrCount, setPaperQrCount] = useState(0);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(id);
  const { mutateAsync: attendPaperQr } = usePaperQrAttendanceMutation(id);

  useQRScanner(setScannedQR);

  const toAttendRequest = ({
    traineeId,
    participantId,
    code,
    phoneNumber,
  }: QrScanData): AttendUserQrRequest | null => {
    if (traineeId && phoneNumber) {
      return {
        authority: toRoleAuthority(USER_AUTHORITY.TRAINEE),
        phoneNumber,
      };
    }
    if (participantId && code) {
      return {
        authority: toRoleAuthority(USER_AUTHORITY.STANDARD),
        participantId,
        code,
      };
    }
    return null;
  };

  const fetchUserData = async (scannedQR: QrScanData) => {
    // 종이 QR은 참가자 정보가 없어 표에 넣지 않고 입장 수만 센다
    if (scannedQR.token) {
      await attendPaperQr(scannedQR.token);
      setPaperQrCount((prev) => prev + 1);
      return;
    }
    const request = toAttendRequest(scannedQR);
    if (!request) {
      toast.error('입장 QR 형식이 올바르지 않습니다.');
      return;
    }
    const newUser: AttendUserResponse = await attendUser(request);
    setUserData((prev) => [...prev, newUser]);
  };

  useEffect(() => {
    if (!scannedQR) return;
    const handleScan = async () => {
      try {
        await fetchUserData(scannedQR);
      } catch {
        // 실패 안내는 mutation의 onError가 띄운다
      } finally {
        setScannedQR(null);
      }
    };
    handleScan();
  }, [scannedQR]);

  const userQrPrintActions = {
    PrintBadge: (selectItem: number) => userQrPrint(userData, selectItem),
  };

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
      <ExhibitionCheckInHeader />
      {paperQrCount > 0 && (
        <p className="text-body2r text-gray-500">
          종이 QR 입장 {paperQrCount}명
        </p>
      )}
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
