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
import { toAttendUserRowKey, userQrPrint } from '../../model/userQrPrint';

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
    // 예전 일반 참가자 QR({participantId, phoneNumber})은 서버가 번호로 찾는다
    if (participantId && phoneNumber) {
      return {
        authority: toRoleAuthority(USER_AUTHORITY.STANDARD),
        phoneNumber,
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
    // 5분 안에 같은 QR을 다시 찍으면 서버가 처음 응답을 그대로 돌려준다
    const rowKey = toAttendUserRowKey(newUser);
    if (userData.some((user) => toAttendUserRowKey(user) === rowKey)) {
      toast.info(`${newUser.name}님은 이미 입장 처리되었습니다.`);
      return;
    }
    setUserData((prev) =>
      prev.some((user) => toAttendUserRowKey(user) === rowKey)
        ? prev
        : [...prev, newUser],
    );
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
    PrintBadge: (selectItem: string) => userQrPrint(userData, selectItem),
  };

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
      <ExhibitionCheckInHeader />
      {paperQrCount > 0 && (
        <p className="text-body2r text-gray-500">
          종이 QR 입장 {paperQrCount}명 (이 화면에서 스캔한 수)
        </p>
      )}
      <TableForm
        categories={CHECK_IN_PRINT_CATEGORIES}
        data={userData}
        getRowKey={toAttendUserRowKey}
        maxHeight="414px"
        footerType="print"
        text="QR 스캔"
        actions={userQrPrintActions}
      />
    </div>
  );
};

export default QRScannerTable;
