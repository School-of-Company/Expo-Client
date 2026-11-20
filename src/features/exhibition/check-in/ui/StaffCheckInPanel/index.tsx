'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import {
  badgePrintHint,
  errorResult,
  reEntryResult,
  ScanResult,
  scanFailureResult,
  successResult,
} from '../../model/scanResult';
import { toAttendRequest } from '../../model/toAttendRequest';
import { toExitRequest } from '../../model/toExitRequest';
import { useExitUserMutation } from '../../model/useExitUserMutation';
import { usePaperQrAttendanceMutation } from '../../model/usePaperQrAttendanceMutation';
import { usePatchAttendUserMutation } from '../../model/usePatchAttendUserMutation';
import { useScannerSettings } from '../../model/useScannerSettings';
import CameraScanner from '../CameraScanner';
import ManualScanInput from '../ManualScanInput';
import ScanModeToggle from '../ScanModeToggle';
import ScannerNameInput from '../ScannerNameInput';
import ScanResultCard from '../ScanResultCard';
import WalkInPanel from '../WalkInPanel';

/**
 * 스태프 링크 화면의 입장·퇴장·간편입장. 관리자 화면(QRScannerTable)과 같은 요청을 보내되
 * 명단 표·명찰 출력·집계처럼 개인정보나 관리자 권한이 필요한 부분은 뺀 폰 화면이다.
 * 요청 인스턴스는 바깥의 ScanHttpProvider 가 스태프 토큰으로 바꿔 준다
 */
const StaffCheckInPanel = ({ expoId }: { expoId: string }) => {
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const { scannerName, setScannerName, mode, setMode } =
    useScannerSettings(expoId);
  const { mutateAsync: attendUser } = usePatchAttendUserMutation(
    expoId,
    scannerName,
  );
  const { mutateAsync: attendPaperQr } = usePaperQrAttendanceMutation(
    expoId,
    scannerName,
  );
  const { mutateAsync: exitUser } = useExitUserMutation(expoId, scannerName);

  const handleInvalidQr = useCallback(
    (message: string) => setLastResult(errorResult('읽을 수 없는 QR', message)),
    [],
  );
  const { submitScan, clearLastScan } = useQRScanner(
    setScannedQR,
    handleInvalidQr,
  );

  const reject = (title: string, message: string) => {
    toast.error(message);
    setLastResult(errorResult(title, message));
  };

  const handleExit = async (qr: QrScanData) => {
    const request = toExitRequest(qr);
    if (!request) {
      reject(
        '퇴장 실패',
        '퇴장 처리할 수 없는 QR입니다. 예전 참가자 QR은 퇴장을 기록하지 않습니다.',
      );
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

  const handleEntry = async (qr: QrScanData) => {
    if (qr.token) {
      const { entryStatus, firstEnteredTime } = await attendPaperQr(qr.token);
      setLastResult(
        entryStatus === 'RE_ENTRY'
          ? reEntryResult('종이 QR', firstEnteredTime)
          : successResult('입장 완료', '종이 QR'),
      );
      return;
    }
    const request = toAttendRequest(qr);
    if (!request) {
      reject('입장 실패', '입장 QR 형식이 올바르지 않습니다.');
      return;
    }
    const user = await attendUser(request);
    if (user.entryStatus === 'RE_ENTRY') {
      setLastResult(reEntryResult(user.name, user.firstEnteredTime));
      return;
    }
    // 명찰 출력대 조회는 관리자 화면에서만 해서 여기서는 정적 안내만 보여 준다
    setLastResult({
      ...successResult('입장 완료', user.name),
      hint: badgePrintHint(user),
    });
  };

  useEffect(() => {
    if (!scannedQR) return;
    const run = async () => {
      try {
        if (mode === 'exit') await handleExit(scannedQR);
        else await handleEntry(scannedQR);
      } catch (error) {
        clearLastScan();
        // 토스트는 mutation 의 onError 가 띄우고, 결과 카드에는 같은 문구를 남긴다
        setLastResult(scanFailureResult(mode, error));
      } finally {
        setScannedQR(null);
      }
    };
    run();
  }, [scannedQR]);

  const isExitMode = mode === 'exit';

  return (
    <div className="flex flex-col gap-16">
      <div
        className={`flex flex-wrap items-center justify-between gap-12 rounded-sm border-1 border-solid px-16 py-12 ${
          isExitMode ? 'border-error' : 'border-main-600 bg-main-100'
        }`}
      >
        <p
          role="status"
          className={`text-h3b ${isExitMode ? 'text-error' : 'text-main-600'}`}
        >
          {isExitMode ? '퇴장 모드' : '입장 모드'}
        </p>
        <ScanModeToggle mode={mode} onChange={setMode} />
      </div>
      <ScanResultCard
        expoId={expoId}
        mode={mode}
        result={lastResult}
        isProcessing={scannedQR !== null}
      />
      <section className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-16">
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
            {isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          </button>
        </div>
        {isCameraOn && <CameraScanner onScan={submitScan} />}
        <div className="space-y-8">
          <p className="text-caption1r text-gray-600">QR 값 직접 입력</p>
          <ManualScanInput onSubmit={submitScan} />
        </div>
        <div className="space-y-8">
          <p className="text-caption1r text-gray-600">스캐너 이름</p>
          <ScannerNameInput scannerName={scannerName} onSave={setScannerName} />
        </div>
      </section>
      <WalkInPanel
        expoId={expoId}
        scannerName={scannerName}
        isExitMode={isExitMode}
      />
    </div>
  );
};

export default StaffCheckInPanel;
