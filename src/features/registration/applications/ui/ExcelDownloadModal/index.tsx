'use client';

import { useEffect, useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import {
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import { Button } from '@/shared/ui';
import { useReportExcelDownload } from '../../../common';
import { AdminApplicationStatus } from '../../../common/api/ledgerApi';
import {
  LEDGER_STATUS_LABEL,
  LedgerFilter,
  LedgerRow,
} from '../../../common/model/ledger';
import {
  ATTENDANCE_FILTER_BLOCKER,
  buildExcelDownloadPlan,
  EXCEL_TEMPLATE_OPTIONS,
  getAllowedScopes,
} from '../../model/excelDownload';

type StatusCounts = Partial<Record<AdminApplicationStatus, number>>;

interface ExcelDownloadModalProps {
  expoId: string;
  selectedRows: LedgerRow[];
  filter: LedgerFilter;
  /** 현재 필터 전체 건수와 상태 집계 (서버 기준) */
  filterCount: number;
  filterStatusCounts: StatusCounts;
  onClose: () => void;
}

const STATUSES: AdminApplicationStatus[] = [
  'CONFIRMED',
  'WAITING',
  'CANCELLED',
];

const countByStatus = (rows: LedgerRow[]): StatusCounts =>
  Object.fromEntries(
    STATUSES.map((status) => [
      status,
      rows.filter((row) => row.status === status).length,
    ]),
  );

const describeStatus = (counts: StatusCounts) =>
  STATUSES.map(
    (status) => `${LEDGER_STATUS_LABEL[status]} ${counts[status] ?? 0}`,
  ).join(' · ');

const ExcelDownloadModal = ({
  expoId,
  selectedRows,
  filter,
  filterCount,
  filterStatusCounts,
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
    () => buildExcelDownloadPlan({ template, scope, selectedRows, filter }),
    [template, scope, selectedRows, filter],
  );

  const { blockers } = plan;
  const canDownload = !!plan.request && !isPending;

  const allowedScopes = getAllowedScopes(template);

  // 고를 수 없는 범위가 선택되어 있으면 선택한 신청으로 옮긴다
  const handleTemplateChange = (value: ReportExcelTemplate) => {
    setTemplate(value);
    if (!getAllowedScopes(value).includes(scope)) setScope('SELECTED');
  };

  const handleDownload = () => {
    if (!canDownload || !plan.request) return;
    download({ expoId, request: plan.request });
  };

  const targetCount = scope === 'SELECTED' ? selectedRows.length : filterCount;
  const targetStatusCounts =
    scope === 'SELECTED' ? countByStatus(selectedRows) : filterStatusCounts;
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
      count: filterCount,
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
                onClick={() => handleTemplateChange(value)}
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
                disabled={!allowedScopes.includes(value)}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
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
            대상 신청 {targetCount}건 ({describeStatus(targetStatusCounts)})
            {scope === 'FILTER' &&
              '. 화면 페이지와 관계없이 서버가 필터 조건 전체를 다시 조회합니다. 상태를 고르지 않으면 모든 상태가 포함됩니다'}
            {isPersonDeduped &&
              '. 같은 사람은 1번만 출력되어 행 수가 신청 건수보다 적을 수 있습니다'}
            .
          </p>
          {!allowedScopes.includes('FILTER') && (
            <p className="text-caption1r text-gray-500">
              {ATTENDANCE_FILTER_BLOCKER}
            </p>
          )}
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
