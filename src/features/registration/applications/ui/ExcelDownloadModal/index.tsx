'use client';

import { useEffect, useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import {
  RegistrationProgram,
  RegistrationSession,
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import { Button } from '@/shared/ui';
import {
  ApplicationRow,
  FUTURE_EDU_EXPO_INFO,
  STATUS_LABEL,
  useReportExcelDownload,
} from '../../../common';
import { ApplicationFilter } from '../../model/applicationFilter';
import {
  buildExcelDownloadPlan,
  EXCEL_TEMPLATE_OPTIONS,
} from '../../model/excelDownload';

interface ExcelDownloadModalProps {
  selectedRows: ApplicationRow[];
  filteredRows: ApplicationRow[];
  filter: ApplicationFilter;
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  onClose: () => void;
}

const describeStatus = (rows: ApplicationRow[]) =>
  (['CONFIRMED', 'WAITING', 'CANCELED'] as const)
    .map(
      (status) =>
        `${STATUS_LABEL[status]} ${rows.filter((row) => row.status === status).length}`,
    )
    .join(' · ');

const ExcelDownloadModal = ({
  selectedRows,
  filteredRows,
  filter,
  programs,
  sessions,
  onClose,
}: ExcelDownloadModalProps) => {
  const [template, setTemplate] = useState<ReportExcelTemplate>('STANDARD');
  const [scope, setScope] = useState<ReportExcelScope>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTER',
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 성공·실패와 관계없이 대장의 선택과 필터는 그대로 둔다
  const { mutate: download, isPending } = useReportExcelDownload(onClose);

  const plan = useMemo(
    () =>
      buildExcelDownloadPlan({
        template,
        scope,
        selectedRows,
        filter,
        programs,
        sessions,
      }),
    [template, scope, selectedRows, filter, programs, sessions],
  );

  const { expoId } = FUTURE_EDU_EXPO_INFO;
  const blockers = expoId
    ? plan.blockers
    : [
        '행사 ID가 아직 연결되지 않았습니다. 접수 원장 API 연결 후 사용할 수 있습니다.',
        ...plan.blockers,
      ];
  const canDownload = !!expoId && !!plan.request && !isPending;

  const handleDownload = () => {
    if (!expoId || !plan.request || isPending) return;
    download({ expoId, request: plan.request });
  };

  const targetRows = scope === 'SELECTED' ? selectedRows : filteredRows;
  const isPersonDeduped = template === 'STANDARD' || template === 'TRAINEE';

  const scopeOptions: {
    value: ReportExcelScope;
    label: string;
    count: number;
  }[] = [
    { value: 'SELECTED', label: '선택한 신청', count: selectedRows.length },
    {
      value: 'FILTER',
      label: '현재 필터 전체',
      count: filteredRows.length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[40px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] mobile:px-20">
        <div className="flex items-center">
          <p className="flex-grow text-center text-h2r text-black mobile:text-body1r">
            엑셀 다운로드
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="닫기"
          >
            <XMark />
          </button>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">양식</p>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {EXCEL_TEMPLATE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTemplate(value)}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
                  template === value ? 'border-main-600' : 'border-gray-200'
                }`}
              >
                {template === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                <span className="text-body2r text-black">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-caption1r text-gray-500">
            {
              EXCEL_TEMPLATE_OPTIONS.find(({ value }) => value === template)
                ?.description
            }
          </p>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">범위</p>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {scopeOptions.map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
                  scope === value ? 'border-main-600' : 'border-gray-200'
                }`}
              >
                {scope === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                <span className="text-body2r text-black">{label}</span>
                <span className="ml-auto text-body2r text-main-600">
                  {count}
                </span>
              </button>
            ))}
          </div>
          <p className="text-caption1r text-gray-500">
            대상 신청 {targetRows.length}건 ({describeStatus(targetRows)})
            {scope === 'FILTER' &&
              '. 화면 페이지와 관계없이 서버가 필터 조건 전체를 다시 조회하므로 최종 건수는 서버 기준입니다'}
            {isPersonDeduped &&
              '. 같은 사람은 1번만 출력되어 행 수가 신청 건수보다 적을 수 있습니다'}
            .
          </p>
        </div>

        {blockers.length > 0 && (
          <div className="space-y-[10px]">
            <p className="text-h3b text-black">다운로드할 수 없는 이유</p>
            <ul className="list-disc space-y-4 rounded-sm border-1 border-solid border-gray-200 py-12 pl-32 pr-16 text-body2r text-gray-500">
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}

        <Button type="button" disabled={!canDownload} onClick={handleDownload}>
          {isPending ? '파일 만드는 중...' : 'XLSX 다운로드'}
        </Button>
      </div>
    </div>
  );
};

export default ExcelDownloadModal;
