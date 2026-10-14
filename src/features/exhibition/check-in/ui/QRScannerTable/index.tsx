'use client';

import React, { useCallback, useState, useEffect } from 'react';
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
import { errorResult, ScanResult, successResult } from '../../model/scanResult';
import { toExitRequest } from '../../model/toExitRequest';
import { useInvalidateEntrySummary } from '../../model/useEntrySummary';
import { useExitUserMutation } from '../../model/useExitUserMutation';
import { usePaperQrAttendanceMutation } from '../../model/usePaperQrAttendanceMutation';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';
import { toAttendUserRowKey, userQrPrint } from '../../model/userQrPrint';
import CameraScanner from '../CameraScanner';
import EntrySummaryPanel from '../EntrySummaryPanel';
import ManualScanInput from '../ManualScanInput';
import ScanModeToggle, { ScanMode } from '../ScanModeToggle';
import ScanResultCard from '../ScanResultCard';
import WalkInPanel from '../WalkInPanel';

const QRScannerTable = ({ id }: { id: string }) => {
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<AttendUserResponse[]>([]);
  const [paperQrCount, setPaperQrCount] = useState(0);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(id);
  const { mutateAsync: attendPaperQr } = usePaperQrAttendanceMutation(id);
  const { mutateAsync: exitUser } = useExitUserMutation(id);
  const invalidateSummary = useInvalidateEntrySummary(id);
  const [mode, setMode] = useState<ScanMode>('entry');
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleInvalidQr = useCallback(
    (message: string) => setLastResult(errorResult('읽을 수 없는 QR', message)),
    [],
  );
  const { submitScan } = useQRScanner(setScannedQR, handleInvalidQr);

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

  const handleExit = async (scannedQR: QrScanData) => {
    const request = toExitRequest(scannedQR);
    if (!request) {
      const message =
        '퇴장 처리할 수 없는 QR입니다. 예전 참가자 QR은 퇴장을 기록하지 않습니다.';
      toast.error(message);
      setLastResult(errorResult('퇴장 실패', message));
      return;
    }
    const { enteredTime, exitedTime, stayedMinutes } = await exitUser(request);
    setLastResult(
      successResult(
        '퇴장 완료',
        `${enteredTime} 입장 → ${exitedTime} 퇴장 (${stayedMinutes}분 체류)`,
      ),
    );
  };

  const fetchUserData = async (scannedQR: QrScanData) => {
    if (mode === 'exit') {
      await handleExit(scannedQR);
      return;
    }
    // 종이 QR은 참가자 정보가 없어 표에 넣지 않고 입장 수만 센다
    if (scannedQR.token) {
      await attendPaperQr(scannedQR.token);
      setPaperQrCount((prev) => prev + 1);
      setLastResult(successResult('입장 완료', '종이 QR'));
      return;
    }
    const request = toAttendRequest(scannedQR);
    if (!request) {
      toast.error('입장 QR 형식이 올바르지 않습니다.');
      setLastResult(
        errorResult('입장 실패', '입장 QR 형식이 올바르지 않습니다.'),
      );
      return;
    }
    const newUser: AttendUserResponse = await attendUser(request);
    // 5분 안에 같은 QR을 다시 찍으면 서버가 처음 응답을 그대로 돌려준다
    const rowKey = toAttendUserRowKey(newUser);
    if (userData.some((user) => toAttendUserRowKey(user) === rowKey)) {
      toast.info(`${newUser.name}님은 이미 입장 처리되었습니다.`);
      setLastResult(successResult('이미 입장 처리됨', newUser.name));
      return;
    }
    setLastResult(
      successResult(
        '입장 완료',
        newUser.badge ? `${newUser.name} · 명찰 출력 대상` : newUser.name,
      ),
    );
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
        // 처리한 건수가 바로 보이도록 집계를 다시 읽는다
        invalidateSummary();
      } catch (error) {
        // 토스트는 mutation의 onError가 띄우고, 결과 카드에는 같은 문구를 남긴다
        setLastResult(
          errorResult(
            `${mode === 'entry' ? '입장' : '퇴장'} 실패`,
            error instanceof Error ? error.message : undefined,
          ),
        );
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
      <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-start">
        <ExhibitionCheckInHeader />
        <ScanModeToggle mode={mode} onChange={setMode} />
      </div>
      {mode === 'exit' && (
        <p className="break-keep text-body2r text-main-600">
          퇴장 모드입니다. 스캔한 QR은 퇴장으로 기록되고 아래 표에는 추가되지
          않습니다.
        </p>
      )}
      <section className="grid grid-cols-2 gap-24 mobile:grid-cols-1">
        <div className="space-y-12">
          <p className="text-body1b text-black">QR 스캔</p>
          <p className="break-keep text-body2r text-gray-500">
            USB 스캐너는 버튼 없이 바로 처리됩니다. 스캐너가 읽지 못하면 값을
            직접 입력하세요.
          </p>
          <ManualScanInput onSubmit={submitScan} />
          <button
            type="button"
            onClick={() => setIsCameraOn((prev) => !prev)}
            aria-pressed={isCameraOn}
            className="text-body2r text-main-600 underline"
          >
            {isCameraOn ? '카메라 끄기' : '카메라로 스캔'}
          </button>
          {isCameraOn && <CameraScanner onScan={submitScan} />}
        </div>
        <ScanResultCard
          mode={mode}
          result={lastResult}
          isProcessing={scannedQR !== null}
        />
      </section>
      <WalkInPanel expoId={id} />
      <EntrySummaryPanel expoId={id} />
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
