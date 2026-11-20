'use client';

import { useSearchParams } from 'next/navigation';
import {
  programRosterRequest,
  useReportExcelDownload,
} from '@/features/registration/common';
import { withLoading } from '@/shared/hocs';
import { useExcelDownload } from '@/shared/model';
import { Button } from '@/shared/ui';
import { TableForm } from '@/shared/ui/Table';
import { programCategories } from '../../model/category';
import { useProgramAttendanceScan } from '../../model/useProgramAttendanceScan';
import { useProgramDetailQueries } from '../../model/useProgramDetailData';
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
  const { submitScan, lastResult, isProcessing } = useProgramAttendanceScan({
    expoId,
    programId,
    type: navigation === 'standard' ? 'standard' : 'training',
  });
  const programDetailData = programDetailQueries.data || [];

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
            isProcessing={isProcessing}
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
