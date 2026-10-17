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
  getPreregisterErrorMessage,
  INITIAL_PREREGISTER_FILTER,
  PreregisterFilter,
  usePreregisterLedger,
} from '../../../common/model/preregisterLedger';
import { usePreregisterSummary } from '../../../common/model/preregisterSummary';
import PreregisterDetailModal from '../PreregisterDetailModal';
import PreregisterFilters from '../PreregisterFilters';
import PreregisterTable from '../PreregisterTable';

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
          {/* 엑셀·그룹 메시지는 Report·Notification 이 사전등록 대상을 받으면 다시 붙인다 */}
          <div className="flex justify-end">
            <RefreshStatus
              updatedAt={dataUpdatedAt}
              isFetching={isFetching}
              onRefresh={() => refetch()}
              intervalMs={LEDGER_REFRESH_MS}
              hasError={isError && !!data}
            />
          </div>

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
