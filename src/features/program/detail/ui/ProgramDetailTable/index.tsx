'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { withLoading } from '@/shared/hocs';
import { useExcelDownload, useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { TableForm } from '@/shared/ui/Table';
import { programCategories } from '../../model/category';
import { useProgramDetailQueries } from '../../model/useProgramDetailData';
import { useStandardAttendance } from '../../model/useStandardAttendance';
import { useTrainingAttendance } from '../../model/useTrainingAttendance';

const ProgramDetailTable = ({
  expoId,
  programId,
}: {
  expoId: string;
  programId: string;
}) => {
  const searchParams = useSearchParams();
  const { mutate: standardAttendance } = useStandardAttendance();
  const { mutate: trainingAttendance } = useTrainingAttendance();
  const { mutate: downloadExcel, isPending: isExporting } = useExcelDownload();
  const navigation = searchParams.get('navigation') || 'standard';
  const { programDetailQueries, isLoading } = useProgramDetailQueries(
    programId,
    navigation,
  );
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  useQRScanner(setScannedQR);
  const programDetailData = programDetailQueries.data || [];

  const handleAttendance = ({
    participantId,
    code,
    traineeId,
    token,
  }: QrScanData) => {
    if (token) {
      toast.warn('종이 QR은 박람회 입장에만 사용할 수 있습니다.');
      return;
    }
    if (navigation === 'standard') {
      if (!participantId) {
        toast.error('참가자 QR 형식이 올바르지 않습니다.');
        return;
      }
      // 출석 서버는 program-attendance.require-code가 기본 false라 code 없는 예전 QR도 participantId만으로 받는다.
      // code가 있으면 항상 확인한다. 운영에서 require-code를 켜면 서버가 주는 4xx 메시지를 그대로 보여 준다
      standardAttendance(
        code
          ? { expoId, programId, participantId, code }
          : { expoId, programId, participantId },
      );
    } else {
      if (participantId && code) {
        trainingAttendance({ expoId, programId, participantId, code });
        return;
      }
      if (!traineeId) {
        toast.error('연수자 QR 형식이 올바르지 않습니다.');
        return;
      }
      trainingAttendance({ expoId, programId, traineeId });
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
      downloadExcel({
        path: `/excel/program/${expoId}`,
        params: { programId },
      }),
  };

  const filteActions =
    navigation === 'standard' ? StandardProgramActions : TraineeProgramActions;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-46 overflow-y-auto">
        <p className="text-center text-h2b text-black">프로그램</p>
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
