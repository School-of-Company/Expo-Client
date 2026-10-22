'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { toKstLocal } from '@/shared/libs/kstDateTime';
import { NavigationBar } from '@/shared/ui';
import SmallButton from '@/shared/ui/SmallButton';
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
  PreregisterRow,
  usePreregisterLedger,
} from '../../../common/model/preregisterLedger';
import { usePreregisterSummary } from '../../../common/model/preregisterSummary';
import {
  GroupMessageTarget,
  toPreregisterGroupMessageFilter,
} from '../../model/groupMessage';
import GroupMessageModal from '../GroupMessageModal';
import PreregisterDetailModal from '../PreregisterDetailModal';
import PreregisterFilters from '../PreregisterFilters';
import PreregisterTable from '../PreregisterTable';
import RegistrationExcelModal from '../RegistrationExcelModal';

const OUTLINE_ACTION =
  'rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-6 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600';

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
  // 서버 페이지를 넘겨도 선택이 유지되도록 선택한 행 자체를 보관한다. 값은 접수대장 key 다
  const [selected, setSelected] = useState<Map<string, PreregisterRow>>(
    new Map(),
  );
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const closeDetail = useCallback(() => setDetailKey(null), []);

  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
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
        // 회차 일시는 UTC 오프셋 ISO 라 한국 시각으로 바꿔 넘긴다
        label: `${session.title} · ${formatDefinitionSchedule(toKstLocal(session.startedAt), toKstLocal(session.endedAt))}`,
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
  // 이전 필터 결과나 실패한 조회의 건수로 다운로드를 막지 않도록 현재 조건의 건수만 넘긴다
  const filterCount =
    data && !isPlaceholderData && !isError ? data.totalElements : undefined;
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
  const selectedRows = useMemo(() => Array.from(selected.values()), [selected]);
  const messageTarget = useMemo<GroupMessageTarget>(
    () => ({
      tab: 'PREREGISTER',
      selectedIds: selectedRows.map(({ id }) => id),
      filter: toPreregisterGroupMessageFilter(filter),
      filterCount: totalCount,
      filterBlocker: null,
    }),
    [selectedRows, filter, totalCount],
  );

  const handleToggle = (id: string) =>
    setSelected((prev) => {
      const next = new Map(prev);
      const row = rows.find((item) => item.id === id);
      if (next.has(id)) next.delete(id);
      else if (row) next.set(id, row);
      return next;
    });

  const handleTogglePage = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      const isAllSelected = rows.every(({ id }) => next.has(id));
      rows.forEach((row) =>
        isAllSelected ? next.delete(row.id) : next.set(row.id, row),
      );
      return next;
    });

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
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Map())}
                  className="text-caption1r text-gray-400 underline"
                >
                  선택 해제
                </button>
              )}
              <SmallButton
                text={`그룹 메시지 (${selected.size} 선택)`}
                onClick={() => setIsMessageModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className={OUTLINE_ACTION}
              >
                등록 원장 엑셀
              </button>
            </div>
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
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onTogglePage={handleTogglePage}
            footerActions={
              <p className="text-body2r text-gray-500">
                선택 <span className="text-main-600">{selected.size}</span>
              </p>
            }
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

        {isMessageModalOpen && (
          <GroupMessageModal
            expoId={expoId}
            target={messageTarget}
            onClose={() => setIsMessageModalOpen(false)}
          />
        )}

        {isExcelModalOpen && (
          <RegistrationExcelModal
            expoId={expoId}
            selectedRows={selectedRows}
            filter={filter}
            filterCount={filterCount}
            sessionLabel={sessionLabel}
            onClose={() => setIsExcelModalOpen(false)}
          />
        )}
      </div>
    ),
  });
};

export default PreregisterLedger;
