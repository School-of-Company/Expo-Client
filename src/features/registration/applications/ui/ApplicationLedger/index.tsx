'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { DetailHeader, NavigationBar } from '@/shared/ui';
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
  LedgerRow,
  parseSessionKey,
  useCurrentSessions,
  useLedger,
} from '../../../common/model/ledger';
import ApplicationDetailModal from '../ApplicationDetailModal';
import ExcelDownloadModal from '../ExcelDownloadModal';
import GroupMessageModal from '../GroupMessageModal';
import LedgerFilters from '../LedgerFilters';
import LedgerTable from '../LedgerTable';

const ApplicationLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 의 ?page 는 1부터, 서버 페이지는 0부터
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { expoId } = useRegistrationExpo();

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

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } =
    useLedger(expoId, filter, page - 1);
  const { data: sessions = [] } = useCurrentSessions(expoId);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const totalCount = data?.totalElements ?? 0;
  const totalPage = Math.max(Math.ceil(totalCount / LEDGER_PAGE_SIZE), 1);
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
  const selectedRows = useMemo(() => Array.from(selected.values()), [selected]);

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
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px] overflow-y-auto">
        <DetailHeader textCenter headerTitle="접수 관리대장" />

        <div className="flex justify-end">
          <RefreshStatus
            updatedAt={dataUpdatedAt}
            isFetching={isFetching}
            onRefresh={() => refetch()}
            intervalMs={LEDGER_REFRESH_MS}
            hasError={isError && !!data}
          />
        </div>

        <LedgerFilters
          filter={filter}
          sessions={sessions}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(INITIAL_LEDGER_FILTER)}
        />

        {isError && !data ? (
          <SectionError
            message="접수 원장을 불러오지 못했습니다."
            onRetry={() => refetch()}
          />
        ) : (
          <div className="space-y-16">
            <div className="flex items-center justify-between gap-16 text-body2r text-gray-500">
              <p>
                확정{' '}
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
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onTogglePage={handleTogglePage}
              onRowClick={({ id }) => setDetailId(id)}
              footerActions={
                <>
                  <p className="text-body2r text-gray-500">
                    선택 <span className="text-main-600">{selected.size}</span>
                  </p>
                  <SmallButton
                    text="문자"
                    onClick={() => setIsMessageModalOpen(true)}
                  />
                  <div className="flex items-center gap-20 mobile:gap-12">
                    <p className="text-body1r text-gray-400">출력</p>
                    <SmallButton
                      text="Excel"
                      onClick={() => setIsExcelModalOpen(true)}
                    />
                  </div>
                </>
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
            selectedRows={selectedRows}
            filter={filter}
            filterCount={totalCount}
            onClose={() => setIsMessageModalOpen(false)}
          />
        )}

        {isExcelModalOpen && (
          <ExcelDownloadModal
            expoId={expoId}
            selectedRows={selectedRows}
            filter={filter}
            filterCount={totalCount}
            filterStatusCounts={statusCounts}
            onClose={() => setIsExcelModalOpen(false)}
          />
        )}
      </div>
    ),
  });
};

export default ApplicationLedger;
