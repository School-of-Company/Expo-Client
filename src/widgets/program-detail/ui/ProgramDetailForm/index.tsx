'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import { useQRScanner } from '@/shared/model/useQRScanner';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { TableForm } from '@/shared/ui/Table';
import { programCategories } from '../../model/category';
import { useProgramDetailQueries } from '../../model/useProgramDetailData';
import { useStandardAttendance } from '../../model/useStandardAttendance';
import { useTrainingAttendance } from '../../model/useTrainingAttendance';

const ProgramDetailForm = ({ id }: { id: number }) => {
  const searchParams = useSearchParams();
  const { mutate: standardAttendance } = useStandardAttendance();
  const { mutate: trainingAttendance } = useTrainingAttendance();
  const navigation = searchParams.get('navigation') || 'standard';
  const { programDetailQueries, isLoading } = useProgramDetailQueries(
    id,
    navigation,
  );
  const [scannedQR, setScannedQR] = useState<QrScanData | null>(null);
  useQRScanner(setScannedQR);
  const programDetailData = programDetailQueries.data || [];

  const handleAttendance = (scannedQR: QrScanData) => {
    if (navigation === 'standard') {
      standardAttendance({
        id,
        participantId: scannedQR.participantId!,
        phoneNumber: scannedQR.phoneNumber!,
      });
    } else {
      trainingAttendance({
        id,
        traineeId: scannedQR.traineeId!,
      });
    }
  };

  useEffect(() => {
    if (scannedQR) {
      handleAttendance(scannedQR);
    }
  }, [scannedQR]);

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
        <p className="text-h2 text-center text-black">프로그램</p>
        <TableForm
          categories={programCategories}
          data={programDetailData}
          maxHeight="414px"
          footerType="file"
          text="인원 수"
          actions={fileActions(id)}
        />
      </div>
    ),
  });
};

export default ProgramDetailForm;
