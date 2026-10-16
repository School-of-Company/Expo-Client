'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { NavigationBar } from '@/shared/ui';
import SmallButton from '@/shared/ui/SmallButton';
import {
  RefreshStatus,
  SectionError,
  usePreregisterSessions,
  useRegistrationExpo,
} from '../../../common';
import { GroupMessageSource } from '../../../common/api/groupMessageApi';
import {
  formatDefinitionSchedule,
  LEDGER_PAGE_SIZE,
  LEDGER_REFRESH_MS,
  LEDGER_STATUS_LABEL,
} from '../../../common/model/ledger';
import {
  describePreregisterFilter,
  getPreregisterErrorMessage,
  INITIAL_PREREGISTER_FILTER,
  PreregisterFilter,
  PreregisterRow,
  toPreregisterTargetFilter,
  usePreregisterLedger,
} from '../../../common/model/preregisterLedger';
import GroupMessageModal, { Scope } from '../GroupMessageModal';
import PreregisterDetailModal from '../PreregisterDetailModal';
import PreregisterExcelModal from '../PreregisterExcelModal';
import PreregisterFilters from '../PreregisterFilters';
import PreregisterTable from '../PreregisterTable';

const OUTLINE_ACTION =
  'rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-6 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600';

/** 접수 관리대장의 사전등록 탭. 검색·선택·엑셀·메시지는 이 탭의 조건만 쓴다 */
const PreregisterLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 의 ?page 는 1부터, 서버 페이지는 0부터
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { expoId } = useRegistrationExpo();

  const [filter, setFilter] = useState<PreregisterFilter>(
    INITIAL_PREREGISTER_FILTER,
  );
  // 서버 페이지를 넘겨도 선택이 유지되도록 선택한 행 자체를 보관한다
  const [selected, setSelected] = useState<Map<string, PreregisterRow>>(
    new Map(),
  );
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const closeDetail = useCallback(() => setDetailId(null), []);

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
  const statusCounts = data?.statusCounts ?? {};
  // 이전 필터 결과나 실패한 조회의 건수로 다운로드를 막지 않도록 현재 조건의 건수만 넘긴다
  const confirmedCount =
    data && !isPlaceholderData && !isError ? data.totalElements : undefined;
  const totalPage = Math.max(Math.ceil(totalCount / LEDGER_PAGE_SIZE), 1);
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
  const selectedRows = useMemo(() => Array.from(selected.values()), [selected]);

  const appliedConditions = describePreregisterFilter(
    filter,
    (id) => sessionLabel(Number(id)),
    LEDGER_STATUS_LABEL,
  );
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

  const buildMessageScope = useCallback(
    (scope: Scope): GroupMessageSource['scope'] =>
      scope === 'SELECTED'
        ? {
            kind: 'PREREGISTER_SELECTED',
            reservationIds: selectedRows.map(({ id }) => id),
          }
        : {
            kind: 'PREREGISTER_FILTERED',
            filter: toPreregisterTargetFilter(filter),
          },
    [selectedRows, filter],
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

  return withLoading({
    isLoading: isLoading && !data,
    children: (
      <div className="flex w-full flex-1 flex-col space-y-[54px] overflow-y-auto">
        <div className="space-y-16">
          <div className="flex flex-wrap items-center justify-between gap-12">
            <RefreshStatus
              updatedAt={dataUpdatedAt}
              isFetching={isFetching}
              onRefresh={() => refetch()}
              intervalMs={LEDGER_REFRESH_MS}
              hasError={isError && !!data}
            />
            <div className="flex flex-wrap items-center gap-8">
              <SmallButton
                text={`그룹 메시지 (${selected.size} 선택)`}
                onClick={() => setIsMessageModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className={OUTLINE_ACTION}
              >
                현재 조건 엑셀
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-16 rounded-sm bg-main-100 px-20 py-16 mobile:flex-col mobile:px-16">
            <p className="text-body2r text-gray-500">
              <span className="text-body2b text-main-600">사전등록 탭</span> —
              엑셀·그룹 메시지는 이 탭의 선택과 검색 결과에만 적용됩니다.
              메시지는 대표자 번호로 보내며 동일한 연락처는 중복 발송하지
              않습니다.
              <br />
              적용 중인 조건: {filterSummary}
            </p>
            <p className="shrink-0 whitespace-nowrap text-body2r text-gray-500">
              현재 조회 결과{' '}
              <span className="text-body2b text-main-600">
                {totalCount.toLocaleString()}
              </span>
              건
            </p>
          </div>
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
          <div className="space-y-16">
            <div className="flex items-center justify-between gap-16 text-body2r text-gray-500">
              <p>
                검색 결과{' '}
                <span className="text-black">
                  {totalCount.toLocaleString()}
                </span>
                건(일행)
                {data?.totalApplicants !== undefined && (
                  <>
                    {' · '}인원{' '}
                    <span className="text-black">
                      {data.totalApplicants.toLocaleString()}명
                    </span>
                  </>
                )}
                {' · '}확정{' '}
                <span className="text-main-600">
                  {statusCounts.CONFIRMED ?? 0}
                </span>
                {' · '}대기{' '}
                <span className="text-black">{statusCounts.WAITING ?? 0}</span>
                {' · '}취소 {statusCounts.CANCELLED ?? 0}
              </p>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Map())}
                  className="text-caption1r text-gray-400 underline"
                >
                  선택 해제
                </button>
              )}
            </div>

            <PreregisterTable
              rows={rows}
              totalCount={totalCount}
              sort={filter.sort}
              onSortChange={(sort) => handleFilterChange({ ...filter, sort })}
              sessionLabel={sessionLabel}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onTogglePage={handleTogglePage}
              onRowClick={({ id }) => setDetailId(id)}
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
          </div>
        )}

        {detailId && (
          <PreregisterDetailModal
            expoId={expoId}
            reservationId={detailId}
            sessionLabel={sessionLabel}
            onClose={closeDetail}
          />
        )}

        {isMessageModalOpen && (
          <GroupMessageModal
            expoId={expoId}
            selectedCount={selected.size}
            filterCount={totalCount}
            buildScope={buildMessageScope}
            filteredBlocker={null}
            targetLabel="사전등록"
            onClose={() => setIsMessageModalOpen(false)}
          />
        )}

        {isExcelModalOpen && (
          <PreregisterExcelModal
            expoId={expoId}
            selectedRows={selectedRows}
            filter={filter}
            filterCount={confirmedCount}
            filterSummary={filterSummary}
            onClose={() => setIsExcelModalOpen(false)}
          />
        )}
      </div>
    ),
  });
};

export default PreregisterLedger;
