'use client';

import { useEffect, useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import {
  ReportExcelDownloadRequest,
  ReportExcelScope,
} from '@/shared/types/registration/type';
import { Button } from '@/shared/ui';
import { useReportExcelDownload } from '../../../common';
import { LEDGER_STATUS_LABEL } from '../../../common/model/ledger';
import {
  PreregisterFilter,
  PreregisterRow,
  toPreregisterTargetFilter,
} from '../../../common/model/preregisterLedger';
import {
  FILTER_MAX_COUNT,
  SELECTED_MAX_COUNT,
} from '../../model/excelDownload';

interface PreregisterExcelModalProps {
  expoId: string;
  selectedRows: PreregisterRow[];
  filter: PreregisterFilter;
  /** 현재 필터 전체 건수. 조회가 끝나지 않았으면 비워 둔다 */
  filterCount?: number;
  /** 적용 중인 검색 조건 문구 */
  filterSummary: string;
  onClose: () => void;
}

/** 사전등록 탭의 선택·필터 범위만 내려받는다. 프로그램 탭 조건은 쓰지 않는다 */
const PreregisterExcelModal = ({
  expoId,
  selectedRows,
  filter,
  filterCount,
  filterSummary,
  onClose,
}: PreregisterExcelModalProps) => {
  const [scope, setScope] = useState<ReportExcelScope>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTER',
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const { mutate: download, isPending } = useReportExcelDownload(onClose);

  const { request, blockers } = useMemo(() => {
    const reasons: string[] = [];
    let built: ReportExcelDownloadRequest | null = null;
    if (scope === 'SELECTED') {
      if (selectedRows.length === 0) {
        reasons.push('다운로드할 신청을 선택해주세요.');
      }
      if (selectedRows.length > SELECTED_MAX_COUNT) {
        reasons.push(
          `선택 신청은 최대 ${SELECTED_MAX_COUNT}건까지 보낼 수 있습니다.`,
        );
      }
      built = {
        template: 'STANDARD',
        scope: 'SELECTED',
        source: 'PREREGISTER',
        reservationIds: selectedRows.map(({ id }) => id),
      };
    } else {
      if (filterCount === 0) {
        reasons.push(
          '현재 필터 결과가 0건이라 다운로드할 대상이 없습니다. 필터를 바꾸거나 신청을 선택해서 받아주세요.',
        );
      }
      if (filterCount !== undefined && filterCount > FILTER_MAX_COUNT) {
        reasons.push(
          `현재 필터 전체는 최대 ${FILTER_MAX_COUNT.toLocaleString('ko-KR')}건까지 받을 수 있습니다. 필터를 좁혀주세요.`,
        );
      }
      built = {
        template: 'STANDARD',
        scope: 'FILTER',
        source: 'PREREGISTER',
        preregisterFilter: toPreregisterTargetFilter(filter),
      };
    }
    return { request: reasons.length === 0 ? built : null, blockers: reasons };
  }, [scope, selectedRows, filter, filterCount]);

  const selectedStatus = (['CONFIRMED', 'WAITING', 'CANCELLED'] as const)
    .map(
      (status) =>
        `${LEDGER_STATUS_LABEL[status]} ${selectedRows.filter((row) => row.status === status).length}`,
    )
    .join(' · ');

  const options: { value: ReportExcelScope; label: string; count?: number }[] =
    [
      { value: 'SELECTED', label: '선택한 신청', count: selectedRows.length },
      { value: 'FILTER', label: '현재 필터 전체', count: filterCount },
    ];

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[40px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] mobile:px-20">
        <div className="flex items-center">
          <p className="flex-grow text-center text-h2r text-black mobile:text-body1r">
            사전등록 엑셀 다운로드
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
          <p className="text-h3b text-black">범위</p>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {options.map(({ value, label, count }) => (
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
                  {count ?? '-'}
                </span>
              </button>
            ))}
          </div>
          <p className="text-caption1r text-gray-500">
            {scope === 'SELECTED'
              ? `선택한 사전등록 ${selectedRows.length}건 (${selectedStatus})`
              : `현재 사전등록 탭의 검색 결과 ${filterCount ?? '-'}건 · 조건: ${filterSummary}`}
            . 일행 단위 신청 건수이며 참가자 명단은 사람 기준으로 출력됩니다.
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

        <Button
          type="button"
          disabled={!request || isPending}
          onClick={() => request && download({ expoId, request })}
        >
          {isPending ? '파일 만드는 중...' : 'XLSX 다운로드'}
        </Button>
      </div>
    </div>
  );
};

export default PreregisterExcelModal;
