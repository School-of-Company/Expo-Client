'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { NavigationBar } from '@/shared/ui';
import {
  RefreshStatus,
  SectionError,
  usePreregisterSessions,
  useRegistrationExpo,
} from '../../../common';
import {
  formatDefinitionSchedule,
  LEDGER_PAGE_SIZE,
  LEDGER_REFRESH_MS,
} from '../../../common/model/ledger';
import {
  describePreregisterFilter,
  getPreregisterErrorMessage,
  INITIAL_PREREGISTER_FILTER,
  PreregisterFilter,
  usePreregisterLedger,
} from '../../../common/model/preregisterLedger';
import { usePreregisterSummary } from '../../../common/model/preregisterSummary';
import PreregisterDetailModal from '../PreregisterDetailModal';
import PreregisterFilters from '../PreregisterFilters';
import PreregisterTable from '../PreregisterTable';

const DISABLED_ACTION =
  'cursor-not-allowed rounded-sm border-1 border-solid border-gray-200 bg-gray-50 px-16 py-6 text-body2r text-gray-300';

/** 접수 관리대장의 사전등록 탭. 이 탭의 조건은 프로그램·연수 탭과 섞이지 않는다 */
const PreregisterLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 의 ?page 는 1부터, 서버 페이지는 0부터
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { expoId } = useRegistrationExpo();

  const [filter, setFilter] = useState<PreregisterFilter>(
    INITIAL_PREREGISTER_FILTER,
  );
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const closeDetail = useCallback(() => setDetailKey(null), []);

  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = usePreregisterLedger(expoId, filter, page - 1);
  const { data: sessions = [] } = usePreregisterSessions(expoId);
  // 행사 전체 인원 집계. 실패해도 목록은 보여 주고 이 값만 비워 둔다
  const summary = usePreregisterSummary(expoId);

  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        value: String(session.id),
        label: `${session.title} · ${formatDefinitionSchedule(session.startedAt, session.endedAt)}`,
      })),
    [sessions],
  );
  const sessionLabel = useCallback(
    (sessionId: number) =>
      sessionOptions.find(({ value }) => value === String(sessionId))?.label ??
      `회차 ${sessionId}`,
    [sessionOptions],
  );

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const totalCount = data?.totalElements ?? 0;
  const totalPage = Math.max(Math.ceil(totalCount / LEDGER_PAGE_SIZE), 1);

  const appliedConditions = describePreregisterFilter(filter, sessionLabel);
  const filterSummary =
    appliedConditions.length > 0 ? appliedConditions.join(' · ') : '전체';

  const handleFilterChange = useCallback(
    (next: PreregisterFilter) => {
      setFilter(next);
      // 조건이 바뀌면 첫 페이지로. 탭 구분은 유지한다
      router.replace('?tab=pre');
    },
    [router],
  );

  return withLoading({
    isLoading: isLoading && !data,
    children: (
      <div className="flex w-full flex-1 flex-col space-y-20 overflow-y-auto">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-12">
            <RefreshStatus
              updatedAt={dataUpdatedAt}
              isFetching={isFetching}
              onRefresh={() => refetch()}
              intervalMs={LEDGER_REFRESH_MS}
              hasError={isError && !!data}
            />
            <div className="flex flex-wrap items-center gap-8">
              {/* Report·Notification 이 사전등록 대상을 받기 전이라 성공한 것처럼 보이지 않게 막아 둔다 */}
              <button
                type="button"
                disabled
                title="사전등록 엑셀은 Report 서버 계약 확장 후 제공됩니다"
                className={DISABLED_ACTION}
              >
                엑셀 (준비 중)
              </button>
              <button
                type="button"
                disabled
                title="사전등록 그룹 메시지는 Notification 서버 계약 확장 후 제공됩니다"
                className={DISABLED_ACTION}
              >
                그룹 메시지 (준비 중)
              </button>
            </div>
          </div>

          <p className="text-caption1r text-gray-500">
            <span className="text-caption1b text-main-600">사전등록 탭</span> —
            확정·취소는 참가자 1명, 대기·처리중은 예약 일행 1건이 한 행입니다.
            행 수는 인원 수가 아닙니다. 엑셀·그룹 메시지·관리자 취소는 서버가
            지원하는 대로 열립니다.
          </p>
          <p className="text-caption1r text-gray-500">
            적용 중인 조건: {filterSummary}
          </p>

          {summary.data && (
            <p className="text-body2r text-gray-500">
              행사 전체 인원 — 확정{' '}
              <span className="text-main-600">
                {summary.data.confirmedUniqueParticipants}
              </span>
              명 · 대기 {summary.data.waitingParticipants}명 · 확정 처리중{' '}
              {summary.data.pendingApplicants}명 · 취소 이력{' '}
              {summary.data.cancelledUniqueParticipants}명 (필터와 무관)
            </p>
          )}
        </div>

        <PreregisterFilters
          filter={filter}
          sessions={sessionOptions}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(INITIAL_PREREGISTER_FILTER)}
        />

        {isError && !data ? (
          <SectionError
            message={getPreregisterErrorMessage(
              error,
              '사전등록 목록을 불러오지 못했습니다.',
            )}
            onRetry={() => refetch()}
          />
        ) : (
          <PreregisterTable
            rows={rows}
            totalCount={totalCount}
            sessionLabel={sessionLabel}
            onRowClick={({ id }) => setDetailKey(id)}
          >
            {totalPage > 1 && (
              <div className="flex justify-center">
                <NavigationBar totalPage={totalPage} />
              </div>
            )}
          </PreregisterTable>
        )}

        {detailKey && (
          <PreregisterDetailModal
            expoId={expoId}
            rowKey={detailKey}
            sessionLabel={sessionLabel}
            onClose={closeDetail}
          />
        )}
      </div>
    ),
  });
};

export default PreregisterLedger;
