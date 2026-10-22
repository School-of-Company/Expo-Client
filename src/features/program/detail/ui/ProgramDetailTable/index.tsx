'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  programRosterRequest,
  useReportExcelDownload,
} from '@/features/registration/common';
import { withLoading } from '@/shared/hocs';
import { useExcelDownload, useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { ProgramScanResponse } from '@/shared/types/program/detail/type';
import { Button } from '@/shared/ui';
import { TableForm } from '@/shared/ui/Table';
import { programCategories } from '../../model/category';
import {
  ProgramScanResult,
  programScanFailure,
  programScanSuccess,
} from '../../model/programScanResult';
import { useProgramDetailQueries } from '../../model/useProgramDetailData';
import { useStandardAttendance } from '../../model/useStandardAttendance';
import { useTrainingAttendance } from '../../model/useTrainingAttendance';
import ProgramScanPanel from '../ProgramScanPanel';
import ProgramScanResultCard from '../ProgramScanResultCard';

const ProgramDetailTable = ({
  expoId,
  programId,
}: {
  expoId: string;
  programId: string;
}) => {
  const searchParams = useSearchParams();
  const { mutate: standardAttendance, isPending: isStandardPending } =
    useStandardAttendance();
  const { mutate: trainingAttendance, isPending: isTrainingPending } =
    useTrainingAttendance();
  const { mutate: downloadExcel, isPending: isExcelExporting } =
    useExcelDownload();
  const { mutate: downloadReport, isPending: isReportExporting } =
    useReportExcelDownload(() => {});
  const isExporting = isExcelExporting || isReportExporting;
  const navigation = searchParams.get('navigation') || 'standard';
  const { programDetailQueries, isLoading } = useProgramDetailQueries(
    programId,
    navigation,
  );
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
  const programDetailData = programDetailQueries.data || [];

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
    if (navigation === 'standard') {
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
    } else {
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
    }
  };

  useEffect(() => {
    if (scannedQR) {
      handleAttendance(scannedQR);
    }
  }, [scannedQR]);

  const TraineeProgramActions = {
    exportExcel: () => downloadExcel({ path: `/excel/${expoId}` }),
  };
  const StandardProgramActions = {
    exportExcel: () =>
      downloadReport({
        expoId,
        request: programRosterRequest(Number(programId)),
      }),
  };

  const filteActions =
    navigation === 'standard' ? StandardProgramActions : TraineeProgramActions;

  // 신청 명단과 달리 출석 서비스의 실제 입실 기록을 합친 파일이다. 회차 유형+ID 로 요청한다
  const downloadAttendanceResult = () =>
    downloadExcel({
      path: `/excel/expos/${encodeURIComponent(expoId)}/program-attendances`,
      params: {
        programType: navigation === 'standard' ? 'STANDARD' : 'TRAINING',
        programId,
      },
    });

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-46 overflow-y-auto">
        <p className="text-center text-h2b text-black">프로그램</p>
        <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-stretch">
          <p className="break-keep text-body2r text-gray-500">
            {navigation === 'standard'
              ? '아래 Excel은 이 회차의 확정 신청 명단입니다. 실제 입실 기록은 출석결과 엑셀로 받습니다.'
              : '아래 Excel은 회차별이 아니라 행사 전체 연수자와 신청 강연 명단입니다. 이 회차의 실제 입실 기록은 출석결과 엑셀로 받습니다.'}
          </p>
          <Button
            variant="white"
            width="180px"
            disabled={isExporting}
            onClick={downloadAttendanceResult}
          >
            {isExporting ? '받는 중...' : '출석결과 엑셀'}
          </Button>
        </div>
        <section className="grid grid-cols-2 gap-24 mobile:grid-cols-1">
          <ProgramScanPanel onScan={submitScan} />
          <ProgramScanResultCard
            result={lastResult}
            isProcessing={isStandardPending || isTrainingPending}
          />
        </section>
        <TableForm
          categories={programCategories}
          data={programDetailData}
          maxHeight="414px"
          footerType="file"
          text="인원 수"
          actions={filteActions}
          selectItemBoolean={false}
          isExporting={isExporting}
        />
      </div>
    ),
  });
};

export default ProgramDetailTable;
