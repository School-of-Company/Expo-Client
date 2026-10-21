'use client';

import { useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { useModalDialog } from '@/shared/model';
import {
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import { Button } from '@/shared/ui';
import { useReportExcelDownload } from '../../../common';
import {
  AdminApplicationStatus,
  ProgramSessionDefinition,
} from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LedgerFilter,
  LedgerRow,
  parseSessionKey,
  PROGRAM_TYPE_LABEL,
  toSessionKey,
} from '../../../common/model/ledger';
import {
  ATTENDANCE_FILTER_BLOCKER,
  buildExcelDownloadPlan,
  describeLedgerFilter,
  EXCEL_TEMPLATE_GROUP_LABEL,
  EXCEL_TEMPLATE_OPTIONS,
  ExcelTemplateGroup,
  getAllowedScopes,
} from '../../model/excelDownload';

type StatusCounts = Partial<Record<AdminApplicationStatus, number>>;

interface ExcelDownloadModalProps {
  expoId: string;
  selectedRows: LedgerRow[];
  filter: LedgerFilter;
  /** 필터 조건 문구의 회차 이름 */
  sessions: ProgramSessionDefinition[];
  /** 현재 필터 전체 건수와 상태 집계 (서버 기준). 조회가 끝나지 않았으면 건수는 비워 둔다 */
  filterCount?: number;
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

const TEMPLATE_GROUPS: ExcelTemplateGroup[] = ['LEDGER', 'PERSON'];

const describeStatus = (counts: StatusCounts) =>
  STATUSES.map(
    (status) => `${LEDGER_STATUS_LABEL[status]} ${counts[status] ?? 0}`,
  ).join(' · ');

const ExcelDownloadModal = ({
  expoId,
  selectedRows,
  filter,
  sessions,
  filterCount,
  filterStatusCounts,
  onClose,
}: ExcelDownloadModalProps) => {
  const [template, setTemplate] =
    useState<ReportExcelTemplate>('APPLICATION_LEDGER');
  const [scope, setScope] = useState<ReportExcelScope>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTER',
  );

  // 성공·실패와 관계없이 대장의 선택과 필터는 그대로 둔다
  const { mutate: download, isPending } = useReportExcelDownload(onClose);
  // 파일을 만드는 중에는 닫기 버튼처럼 Escape 로도 닫지 않는다
  const dialogRef = useModalDialog({ onClose, canClose: !isPending });

  const plan = useMemo(
    () =>
      buildExcelDownloadPlan({
        template,
        scope,
        selectedRows,
        filter,
        filterCount,
      }),
    [template, scope, selectedRows, filter, filterCount],
  );

  const { blockers } = plan;
  const canDownload = !!plan.request && !isPending;

  const allowedScopes = getAllowedScopes(template);

  // 고를 수 없는 범위가 선택되어 있으면 선택한 신청으로 옮긴다
  const handleTemplateChange = (value: ReportExcelTemplate) => {
    setTemplate(value);
    if (!getAllowedScopes(value).includes(scope)) setScope('SELECTED');
  };

  const session = sessions.find(
    (item) => toSessionKey(item) === filter.session,
  );
  const filterConditions = describeLedgerFilter(
    filter,
    session &&
      `[${PROGRAM_TYPE_LABEL[session.programType]}] ${session.title} · ${formatDefinitionSchedule(session.startedAt, session.endedAt)}`,
  );

  const handleDownload = () => {
    if (!canDownload || !plan.request) return;
    download({ expoId, request: plan.request });
  };

  const targetCount = scope === 'SELECTED' ? selectedRows.length : filterCount;
  const targetStatusCounts =
    scope === 'SELECTED' ? countByStatus(selectedRows) : filterStatusCounts;
  const isPersonDeduped = template === 'STANDARD' || template === 'TRAINEE';
  // 연수자 명단은 서버가 연수 신청만 고른다. 연수 회차를 고르지 않았으면 대장 건수에 일반 신청이 섞여 있다
  const isTraineeSubset =
    scope === 'FILTER' &&
    template === 'TRAINEE' &&
    parseSessionKey(filter.session)?.programType !== 'TRAINING';

  const scopeOptions: {
    value: ReportExcelScope;
    label: string;
    count?: number;
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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="excel-download-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[40px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] outline-none mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="excel-download-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            엑셀 다운로드
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="닫기"
            className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <XMark />
          </button>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">양식</p>
          {TEMPLATE_GROUPS.map((group) => (
            <div key={group} className="space-y-8">
              <p className="text-caption1b text-gray-500">
                {EXCEL_TEMPLATE_GROUP_LABEL[group]}
              </p>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                {EXCEL_TEMPLATE_OPTIONS.filter(
                  (option) => option.group === group,
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTemplateChange(value)}
                    aria-pressed={template === value}
                    className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
                      template === value ? 'border-main-600' : 'border-gray-200'
                    }`}
                  >
                    {template === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    <span className="text-body2r text-black">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
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
                aria-pressed={scope === value}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  scope === value ? 'border-main-600' : 'border-gray-200'
                }`}
              >
                {scope === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                <span className="text-body2r text-black">{label}</span>
                <span className="ml-auto text-body2r text-main-600">
                  {count ?? '-'}
                </span>
              </button>
            ))}
          </div>
          <p className="text-caption1r text-gray-500">
            {targetCount === undefined
              ? '현재 필터 건수를 확인하고 있습니다'
              : isTraineeSubset
                ? `현재 필터 ${targetCount}건 중 연수 신청만 받습니다. 연수 신청이 없으면 다운로드되지 않습니다`
                : `대상 신청 ${targetCount}건 (${describeStatus(targetStatusCounts)})`}
            {scope === 'FILTER' &&
              '. 화면 페이지와 관계없이 서버가 필터 조건 전체를 대상으로 고정합니다(최대 10000건, 15분 유지). 상태를 고르지 않으면 모든 상태가 포함됩니다'}
            {isPersonDeduped &&
              '. 같은 사람은 1번만 출력되어 행 수가 신청 건수보다 적을 수 있습니다'}
            .
          </p>
          {scope === 'FILTER' && (
            <p className="text-caption1r text-gray-500">
              보내는 조건: {filterConditions.join(' · ')}
            </p>
          )}
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
