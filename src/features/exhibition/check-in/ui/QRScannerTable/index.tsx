'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { maskParticipantPhone } from '@/features/registration/participants';
import { toRoleAuthority, USER_AUTHORITY } from '@/shared/config';
import { useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/exhibition/check-in/type';
import { TableForm } from '@/shared/ui/Table';
import { CHECK_IN_PRINT_CATEGORIES } from '../../model/constants';
import {
  errorResult,
  reEntryResult,
  ScanResult,
  scanFailureResult,
  successResult,
} from '../../model/scanResult';
import { toExitRequest } from '../../model/toExitRequest';
import { useInvalidateEntrySummary } from '../../model/useEntrySummary';
import { useExitUserMutation } from '../../model/useExitUserMutation';
import { usePaperQrAttendanceMutation } from '../../model/usePaperQrAttendanceMutation';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';
import { toAttendUserRowKey, userQrPrint } from '../../model/userQrPrint';
import { useScannerSettings } from '../../model/useScannerSettings';
import CameraScanner from '../CameraScanner';
import EntrySummaryPanel from '../EntrySummaryPanel';
import ManualScanInput from '../ManualScanInput';
import ScanModeToggle from '../ScanModeToggle';
import ScannerNameInput from '../ScannerNameInput';
import ScanResultCard from '../ScanResultCard';
import WalkInPanel from '../WalkInPanel';

const QRScannerTable = ({ id }: { id: string }) => {
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [userData, setUserData] = useState<AttendUserResponse[]>([]);
  const [paperQrCount, setPaperQrCount] = useState(0);
  // 스캐너 이름과 모드는 새로고침해도 유지되도록 박람회별로 저장한다
  const { scannerName, setScannerName, mode, setMode } = useScannerSettings(id);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(
    id,
    scannerName,
  );
  const { mutateAsync: attendPaperQr } = usePaperQrAttendanceMutation(
    id,
    scannerName,
  );
  const { mutateAsync: exitUser } = useExitUserMutation(id, scannerName);
  const invalidateSummary = useInvalidateEntrySummary(id);
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
      const { entryStatus, firstEnteredTime } = await attendPaperQr(
        scannedQR.token,
      );
      // 재입장은 누적 입장 수에 다시 세지 않는다
      if (entryStatus === 'RE_ENTRY') {
        setLastResult(reEntryResult('종이 QR', firstEnteredTime));
        return;
      }
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
    // 재입장은 표에 다시 넣지 않고 결과 카드에서만 구분해 보여 준다
    if (newUser.entryStatus === 'RE_ENTRY') {
      toast.info(`${newUser.name}님이 재입장했습니다.`);
      setLastResult(reEntryResult(newUser.name, newUser.firstEnteredTime));
      return;
    }
    // 예전 서버는 5분 안에 같은 QR을 다시 찍으면 처음 응답을 그대로 돌려준다
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
        setLastResult(scanFailureResult(mode, error));
      } finally {
        setScannedQR(null);
      }
    };
    handleScan();
  }, [scannedQR]);

  // 표에는 참가자 목록과 같은 규칙으로 가린 번호만 보여 준다(번호 없으면 '-')
  const maskedUserData = userData.map((user) => ({
    ...user,
    phoneNumber: maskParticipantPhone(user.phoneNumber),
  }));

  const userQrPrintActions = {
    PrintBadge: (selectItem: string) => userQrPrint(userData, selectItem),
  };

  const isExitMode = mode === 'exit';

  return (
    <div className="flex w-full flex-1 flex-col gap-24 overflow-y-auto">
      {/* 지금 모드를 늘 보여 주고, 퇴장은 잘못 찍지 않도록 눈에 띄게 둔다 */}
      <div
        className={`flex flex-wrap items-center justify-between gap-16 rounded-sm border-1 border-solid px-24 py-20 mobile:px-16 ${
          isExitMode ? 'border-error' : 'border-main-600 bg-main-100'
        }`}
      >
        <div role="status" className="space-y-4">
          <p
            className={`text-h3b ${isExitMode ? 'text-error' : 'text-main-600'}`}
          >
            {isExitMode ? '퇴장 모드' : '입장 모드'}
          </p>
          <p className="break-keep text-body2r text-gray-600">
            {isExitMode
              ? '스캔한 QR은 퇴장으로 기록되고 아래 표에는 추가되지 않습니다.'
              : '스캔한 QR은 입장으로 기록됩니다. 다시 들어오는 분은 먼저 퇴장 처리해야 합니다.'}
          </p>
        </div>
        <ScanModeToggle mode={mode} onChange={setMode} />
      </div>
      <section className="grid grid-cols-2 gap-24 mobile:grid-cols-1">
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
          <div className="flex items-center justify-between gap-12">
            <p className="text-body1b text-black">QR 스캔</p>
            <button
              type="button"
              onClick={() => setIsCameraOn((prev) => !prev)}
              aria-pressed={isCameraOn}
              className={`rounded-sm border-1 border-solid px-16 py-8 text-caption1b ${
                isCameraOn
                  ? 'border-main-600 bg-main-600 text-white'
                  : 'border-main-600 text-main-600'
              }`}
            >
              {isCameraOn ? '카메라 끄기' : '카메라로 스캔'}
            </button>
          </div>
          {isCameraOn && <CameraScanner onScan={submitScan} />}
          <div className="space-y-8">
            <p className="text-caption1r text-gray-600">스캐너 이름</p>
            <ScannerNameInput
              scannerName={scannerName}
              onSave={setScannerName}
            />
          </div>
          <div className="space-y-8">
            <p className="text-caption1r text-gray-600">QR 값 직접 입력</p>
            <ManualScanInput onSubmit={submitScan} />
          </div>
        </div>
        <ScanResultCard
          mode={mode}
          result={lastResult}
          isProcessing={scannedQR !== null}
        />
      </section>
      <WalkInPanel
        expoId={id}
        scannerName={scannerName}
        isExitMode={isExitMode}
      />
      <EntrySummaryPanel expoId={id} />
      {paperQrCount > 0 && (
        <p className="text-body2r text-gray-500">
          이 화면에서 종이 QR로 입장 처리한 인원 {paperQrCount}명
        </p>
      )}
      <TableForm
        categories={CHECK_IN_PRINT_CATEGORIES}
        data={maskedUserData}
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
