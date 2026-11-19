import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { ProgramScanResponse } from '@/shared/types/program/detail/type';
import {
  ProgramScanResult,
  programScanFailure,
  programScanSuccess,
} from './programScanResult';
import { useStandardAttendance } from './useStandardAttendance';
import { useTrainingAttendance } from './useTrainingAttendance';

export type ProgramScanType = 'standard' | 'training';

/**
 * 프로그램 회차 QR 출석. 관리자 회차 화면과 스태프 링크 화면이 같이 쓴다.
 * 요청 인스턴스는 ScanHttpProvider 를 따른다
 */
export const useProgramAttendanceScan = ({
  expoId,
  programId,
  type,
}: {
  expoId: string;
  programId: string;
  type: ProgramScanType;
}) => {
  const { mutate: standardAttendance, isPending: isStandardPending } =
    useStandardAttendance();
  const { mutate: trainingAttendance, isPending: isTrainingPending } =
    useTrainingAttendance();
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  const [lastResult, setLastResult] = useState<ProgramScanResult | null>(null);
  const handleInvalidQr = useCallback(
    (message: string) =>
      setLastResult(programScanFailure(new Error(message), '읽을 수 없는 QR')),
    [],
  );
  const { submitScan, clearLastScan } = useQRScanner(
    setScannedQR,
    handleInvalidQr,
  );
  // 토스트는 mutation의 onError가 띄우고, 결과 카드에는 같은 문구를 남긴다
  const scanCallbacks = {
    onSuccess: (response: ProgramScanResponse) =>
      setLastResult(programScanSuccess(response)),
    onError: (error: Error) => {
      clearLastScan();
      setLastResult(programScanFailure(error));
    },
  };

  const rejectFormat = (message: string) => {
    toast.error(message);
    setLastResult(programScanFailure(new Error(message), '읽을 수 없는 QR'));
  };

  const handleAttendance = ({
    participantId,
    code,
    traineeId,
    token,
  }: QrScanData) => {
    if (token) {
      const message = '종이 QR은 박람회 입장에만 사용할 수 있습니다.';
      toast.warn(message);
      setLastResult(programScanFailure(new Error(message), '읽을 수 없는 QR'));
      return;
    }
    if (type === 'standard') {
      if (!participantId) {
        rejectFormat('참가자 QR 형식이 올바르지 않습니다.');
        return;
      }
      // 출석 서버는 program-attendance.require-code가 기본 false라 code 없는 예전 QR도 participantId만으로 받는다.
      // code가 있으면 항상 확인한다. 운영에서 require-code를 켜면 서버가 주는 4xx 메시지를 그대로 보여 준다
      standardAttendance(
        code
          ? { expoId, programId, participantId, code }
          : { expoId, programId, participantId },
        scanCallbacks,
      );
      return;
    }
    if (participantId && code) {
      trainingAttendance(
        { expoId, programId, participantId, code },
        scanCallbacks,
      );
      return;
    }
    if (!traineeId) {
      rejectFormat('연수자 QR 형식이 올바르지 않습니다.');
      return;
    }
    trainingAttendance({ expoId, programId, traineeId }, scanCallbacks);
  };

  useEffect(() => {
    if (scannedQR) {
      handleAttendance(scannedQR);
    }
  }, [scannedQR]);

  // 회차를 바꾸면 이전 회차 결과를 지운다
  useEffect(() => {
    setLastResult(null);
  }, [programId, type]);

  return {
    submitScan,
    lastResult,
    isProcessing: isStandardPending || isTrainingPending,
  };
};
