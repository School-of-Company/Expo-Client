'use client';

import { useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { useModalDialog } from '@/shared/model';
import { ReportExcelScope } from '@/shared/types/registration/type';
import { Button } from '@/shared/ui';
import { useReportExcelDownload } from '../../../common';
import {
  PreregisterFilter,
  PreregisterRow,
} from '../../../common/model/preregisterLedger';
import {
  buildRegistrationExcelPlan,
  describeRegistrationFilter,
  isUnfilteredRegistration,
  REGISTRATION_MAX_COUNT,
} from '../../model/registrationExcelDownload';

interface RegistrationExcelModalProps {
  expoId: string;
  selectedRows: PreregisterRow[];
  filter: PreregisterFilter;
  /** 현재 필터 전체 행 수 (서버 기준). 조회가 끝나지 않았으면 비워 둔다 */
  filterCount?: number;
  sessionLabel: (sessionId: number) => string;
  onClose: () => void;
}

const TEMPLATE_DESCRIPTION =
  '참가자×회차 1건을 1행으로 출력합니다. 같은 사람의 오전·오후 등록, 한 회차 취소와 다른 회차 확정이 각각 나오고, 참가자가 아직 만들어지지 않은 대기 일행은 예약 행으로 구분합니다. 상태·상태 이력·신청일시(KST)·회차 운영일시를 함께 출력합니다. 기존 참가자 명단·수기 출석부는 프로그램·연수 탭에서 받을 수 있습니다.';

/** 접수대장 사전등록 탭의 등록 원장 다운로드. 프로그램·연수 신청 ID 는 받지 않는다 */
const RegistrationExcelModal = ({
  expoId,
  selectedRows,
  filter,
  filterCount,
  sessionLabel,
  onClose,
}: RegistrationExcelModalProps) => {
  const [scope, setScope] = useState<ReportExcelScope>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTER',
  );

  // 성공·실패와 관계없이 대장의 선택과 필터는 그대로 둔다
  const { mutate: download, isPending } = useReportExcelDownload(onClose);
  // 파일을 만드는 중에는 닫기 버튼처럼 Escape 로도 닫지 않는다
  const dialogRef = useModalDialog({ onClose, canClose: !isPending });

  const plan = useMemo(
    () =>
      buildRegistrationExcelPlan({
        scope,
        selectedRows,
        filter,
        filterCount,
      }),
    [scope, selectedRows, filter, filterCount],
  );

  const { blockers } = plan;
  const canDownload = !!plan.request && !isPending;

  const handleDownload = () => {
    if (!canDownload || !plan.request) return;
    download({ expoId, request: plan.request });
  };

  const scopeOptions: {
    value: ReportExcelScope;
    label: string;
    count?: number;
  }[] = [
    { value: 'SELECTED', label: '선택한 행', count: selectedRows.length },
    { value: 'FILTER', label: '현재 필터 전체', count: filterCount },
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
        aria-labelledby="registration-excel-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[40px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] outline-none mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="registration-excel-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            등록 원장 엑셀 다운로드
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
          <p className="text-body2r text-black">사전·현장 등록 원장</p>
          <p className="text-caption1r text-gray-500">{TEMPLATE_DESCRIPTION}</p>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">범위</p>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {scopeOptions.map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                aria-pressed={scope === value}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
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
          {scope === 'FILTER' && (
            <>
              <p className="text-caption1r text-gray-500">
                {filterCount === undefined
                  ? '현재 필터 행 수를 확인하고 있습니다'
                  : `대상 사전등록 ${filterCount}행`}
                . 화면 페이지와 관계없이 서버가 필터 조건 전체를 대상으로
                고정합니다(최대 {REGISTRATION_MAX_COUNT.toLocaleString('ko-KR')}
                행, 15분 유지).
                {isUnfilteredRegistration(filter)
                  ? ' 조건이 없으므로 확정 회차가 없는 현장등록 참가자가 회차 미지정 행으로 더해집니다.'
                  : ' 회차·상태·검색 조건이 있으면 회차 미지정 현장등록 행은 넣지 않습니다.'}
              </p>
              <p className="text-caption1r text-gray-500">
                보내는 조건:{' '}
                {describeRegistrationFilter(filter, sessionLabel).join(' · ')}
              </p>
            </>
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

export default RegistrationExcelModal;
