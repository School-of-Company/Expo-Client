'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { getExpoRoutes } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { NavigationBar } from '@/shared/ui';
import SmallButton from '@/shared/ui/SmallButton';
import {
  RefreshStatus,
  SectionError,
  useRegistrationExpo,
} from '../../../common';
import {
  INITIAL_LEDGER_FILTER,
  LEDGER_PAGE_SIZE,
  LEDGER_REFRESH_MS,
  LedgerFilter,
  getLedgerErrorMessage,
  isParticipantSourceError,
  LedgerRow,
  parseSessionKey,
  useCurrentSessions,
  useLedger,
  useLedgerSummary,
} from '../../../common/model/ledger';
import {
  getFilteredScopeBlocker,
  GroupMessageTarget,
  toGroupMessageFilter,
} from '../../model/groupMessage';
import {
  buildCapacityMap,
  getExpoDays,
  toLedgerViewRows,
} from '../../model/ledgerView';
import ApplicationDetailModal from '../ApplicationDetailModal';
import ExcelDownloadModal from '../ExcelDownloadModal';
import GroupMessageModal from '../GroupMessageModal';
import LedgerFilters from '../LedgerFilters';
import LedgerTable from '../LedgerTable';

const OUTLINE_ACTION =
  'rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-6 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600';

const ApplicationLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 의 ?page 는 1부터, 서버 페이지는 0부터
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { expoId, expo, routes } = useRegistrationExpo();

  // 대시보드 회차 표에서 ?session=TYPE:ID 로 들어오면 그 회차로 시작한다
  const [filter, setFilter] = useState<LedgerFilter>(() => {
    const session = searchParams.get('session') ?? '';
    return parseSessionKey(session)
      ? { ...INITIAL_LEDGER_FILTER, session }
      : INITIAL_LEDGER_FILTER;
  });
  // 서버 페이지를 넘겨도 선택이 유지되도록 선택한 행 자체를 보관한다
  const [selected, setSelected] = useState<Map<string, LedgerRow>>(new Map());
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
  } = useLedger(expoId, filter, page - 1);
  // 같은 조건의 고유 참가자 수. 실패해도 목록은 보여 주고 이 값만 비워 둔다
  const summary = useLedgerSummary(expoId, filter);
  const { data: sessions = [] } = useCurrentSessions(expoId);
  // 정원현황은 필터와 상관없는 회차별 확정 수로 계산한다
  const { data: sessionSummary } = useLedgerSummary(expoId);

  const capacityMap = useMemo(
    () => buildCapacityMap(sessions, sessionSummary?.sessions ?? []),
    [sessions, sessionSummary],
  );
  const rows = useMemo(
    () => toLedgerViewRows(data?.rows ?? [], data?.items ?? [], capacityMap),
    [data, capacityMap],
  );
  const expoDays = useMemo(
    () => getExpoDays(expo?.startedDay, expo?.finishedDay),
    [expo],
  );
  const totalCount = data?.totalElements ?? 0;
  // 이전 필터 결과나 실패한 조회의 건수로 다운로드를 막지 않도록 현재 조건의 건수만 넘긴다
  const confirmedCount =
    data && !isPlaceholderData && !isError ? data.totalElements : undefined;
  const totalPage = Math.max(Math.ceil(totalCount / LEDGER_PAGE_SIZE), 1);
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
  const selectedRows = useMemo(() => Array.from(selected.values()), [selected]);
  const messageTarget = useMemo<GroupMessageTarget>(
    () => ({
      tab: 'PROGRAM',
      selectedIds: selectedRows.map(({ id }) => id),
      filter: toGroupMessageFilter(filter),
      filterCount: totalCount,
      filterBlocker: getFilteredScopeBlocker(filter),
    }),
    [selectedRows, filter, totalCount],
  );

  const handleFilterChange = useCallback(
    (next: LedgerFilter) => {
      setFilter(next);
      router.replace('?');
    },
    [router],
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

  const statusCounts = data?.statusCounts ?? {};

  return withLoading({
    isLoading: isLoading && !data,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-20 overflow-y-auto">
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
              <Link href={routes.schedule} className={OUTLINE_ACTION}>
                모집 제어
              </Link>
              {/* 박람회 운영 페이지를 없애며 프로그램 조회·출석은 여기서 들어간다 */}
              <Link
                href={getExpoRoutes(expoId).program}
                className={OUTLINE_ACTION}
              >
                프로그램 조회·출석
              </Link>
              <Link href={routes.dashboard} className={OUTLINE_ACTION}>
                대시보드
              </Link>
            </div>
          </div>

          {/* 조회 건수는 아래 검색 결과 줄에 있어 안내만 한 줄로 둔다 */}
          <p className="text-caption1r text-gray-500">
            <span className="text-caption1b text-main-600">
              그룹 메시지 발송
            </span>{' '}
            — 체크한 신청자에게 보내거나, 현재 필터 결과 전체에 한 번에 발송할
            수 있습니다. 프로그램·상태·회차를 먼저 필터링하면
            프로그램별/확정자별/대기자별/회차별 그룹 메시지가 됩니다. 동일한
            연락처는 중복 발송하지 않습니다.
          </p>
        </div>

        <LedgerFilters
          filter={filter}
          sessions={sessions}
          onChange={handleFilterChange}
          expoDays={expoDays}
          onReset={() => handleFilterChange(INITIAL_LEDGER_FILTER)}
        />

        {isError && (!data || isParticipantSourceError(error)) ? (
          <SectionError
            message={getLedgerErrorMessage(
              error,
              '접수 원장을 불러오지 못했습니다.',
            )}
            onRetry={() => refetch()}
          />
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between gap-16 text-body2r text-gray-500">
              <p>
                검색 결과{' '}
                <span className="text-black">
                  {totalCount.toLocaleString()}
                </span>
                건 · 고유 참가자{' '}
                <span className="text-black">
                  {summary.data
                    ? `${summary.data.uniqueParticipants.toLocaleString()}명`
                    : summary.isError
                      ? '집계 실패'
                      : '-'}
                </span>
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

            <LedgerTable
              rows={rows}
              totalCount={totalCount}
              sort={filter.sort}
              onSortChange={(sort) => handleFilterChange({ ...filter, sort })}
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
            </LedgerTable>
          </div>
        )}

        {detailId && (
          <ApplicationDetailModal
            expoId={expoId}
            applicationId={detailId}
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
          <ExcelDownloadModal
            expoId={expoId}
            selectedRows={selectedRows}
            filter={filter}
            sessions={sessions}
            filterCount={confirmedCount}
            filterStatusCounts={statusCounts}
            onClose={() => setIsExcelModalOpen(false)}
          />
        )}
      </div>
    ),
  });
};

export default ApplicationLedger;
