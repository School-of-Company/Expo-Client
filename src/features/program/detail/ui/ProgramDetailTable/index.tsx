'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { useQRScanner } from '@/shared/model';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { TableForm } from '@/shared/ui/Table';
import { getStandardProgramExcelFile } from '../../api/getStandardProgramExcelFile';
import { getTraineeProgramExcelFile } from '../../api/getTraineeProgramExcelFile';
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
  const navigation = searchParams.get('navigation') || 'standard';
  const { programDetailQueries, isLoading } = useProgramDetailQueries(
    programId,
    navigation,
  );
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  useQRScanner(setScannedQR);
  const programDetailData = programDetailQueries.data || [];

  const handleAttendance = (scannedQR: QrScanData) => {
    if (navigation === 'standard') {
      standardAttendance({
        programId,
        participantId: scannedQR.participantId!,
        phoneNumber: scannedQR.phoneNumber!,
      });
    } else {
      trainingAttendance({
        programId,
        traineeId: scannedQR.traineeId!,
      });
    }
  };

  useEffect(() => {
    if (scannedQR) {
      handleAttendance(scannedQR);
    }
  }, [scannedQR]);

  const TraineeProgramActions = {
    exportExcel: () => getTraineeProgramExcelFile(expoId),
  };
  const StandardProgramActions = {
    exportExcel: () => getStandardProgramExcelFile(expoId, programId),
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
        />
      </div>
    ),
  });
};

export default ProgramDetailTable;
