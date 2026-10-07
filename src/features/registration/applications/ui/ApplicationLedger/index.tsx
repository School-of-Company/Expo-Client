'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Check, Trash } from '@/shared/assets/icons';
import { withLoading } from '@/shared/hocs';
import { DetailHeader, NavigationBar } from '@/shared/ui';
import SmallButton from '@/shared/ui/SmallButton';
import {
  buildApplicationRows,
  exportApplicationsCsv,
  getSessionStats,
  TableFooterAction,
  useChangeApplicationStatus,
  useRegistrationOverview,
} from '../../../common';
import {
  ApplicationFilter,
  filterApplications,
  INITIAL_FILTER,
  SortKey,
  SortState,
  sortApplications,
} from '../../model/applicationFilter';
import ApplicationFilters from '../ApplicationFilters';
import ApplicationTable from '../ApplicationTable';
import GroupSmsModal from '../GroupSmsModal';

const PAGE_SIZE = 10;

const ApplicationLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading } = useRegistrationOverview();

  const [filter, setFilter] = useState<ApplicationFilter>(() => ({
    ...INITIAL_FILTER,
    programId: searchParams.get('programId') ?? '',
  }));
  const [sort, setSort] = useState<SortState>({ key: 'id', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeApplicationStatus(() => setSelectedIds(new Set()));

  const rows = useMemo(() => (data ? buildApplicationRows(data) : []), [data]);
  const sessionStats = useMemo(
    () => getSessionStats(data?.applications ?? []),
    [data],
  );
  const filteredRows = useMemo(
    () => sortApplications(filterApplications(rows, filter), sort),
    [rows, filter, sort],
  );
  const selectedRows = useMemo(
    () => rows.filter(({ id }) => selectedIds.has(id)),
    [rows, selectedIds],
  );
  const totalPage = Math.max(Math.ceil(filteredRows.length / PAGE_SIZE), 1);
  const pageRows = filteredRows.slice(
    (Math.min(page, totalPage) - 1) * PAGE_SIZE,
    Math.min(page, totalPage) * PAGE_SIZE,
  );

  const countByStatus = (status: string) =>
    filteredRows.filter((row) => row.status === status).length;

  const resetPage = (programId: string) => {
    const params = new URLSearchParams();
    if (programId) params.set('programId', programId);
    router.replace(`?${params.toString()}`);
  };

  const handleFilterChange = (next: ApplicationFilter) => {
    setFilter(next);
    resetPage(next.programId);
  };

  const handleSort = (key: SortKey) =>
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));

  const handleToggle = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleTogglePage = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isAllSelected = pageRows.every(({ id }) => next.has(id));
      pageRows.forEach(({ id }) =>
        isAllSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });

  const handleChangeStatus = (
    ids: number[],
    status: 'CONFIRMED' | 'CANCELED',
  ) => {
    if (ids.length === 0) {
      toast.error('신청자를 선택해주세요.');
      return;
    }
    const message =
      status === 'CONFIRMED'
        ? `${ids.length}건을 확정으로 승급할까요? 대기 중이고 공석이 있는 회차만 처리됩니다.`
        : `${ids.length}건을 취소할까요? 자동 승급 회차는 대기자가 순서대로 확정됩니다.`;
    if (!window.confirm(message)) return;
    changeStatus({ applicationIds: ids, status });
  };

  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      toast.error('내보낼 신청 내역이 없습니다.');
      return;
    }
    exportApplicationsCsv(filteredRows);
  };

  const selectedIdList = Array.from(selectedIds);

  return withLoading({
    isLoading: isLoading || !data,
    children: data && (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px] overflow-y-auto">
        <DetailHeader textCenter headerTitle="접수 관리대장" />

        <ApplicationFilters
          filter={filter}
          programs={data.programs}
          sessions={data.sessions}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(INITIAL_FILTER)}
        />

        <div className="space-y-16">
          <div className="flex items-center justify-between gap-16 text-body2r text-gray-500">
            <p>
              확정{' '}
              <span className="text-main-600">
                {countByStatus('CONFIRMED')}
              </span>
              {' · '}대기{' '}
              <span className="text-black">{countByStatus('WAITING')}</span>
              {' · '}취소 {countByStatus('CANCELED')}
            </p>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-caption1r text-gray-400 underline"
              >
                선택 해제
              </button>
            )}
          </div>

          <ApplicationTable
            rows={pageRows}
            totalCount={filteredRows.length}
            sessionStats={sessionStats}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleTogglePage}
            sort={sort}
            onSort={handleSort}
            onChangeStatus={handleChangeStatus}
            isChangingStatus={isChangingStatus}
            footerActions={
              <>
                <p className="text-body2r text-gray-500">
                  선택 <span className="text-main-600">{selectedIds.size}</span>
                </p>
                <TableFooterAction
                  text="승급"
                  icon={<Check />}
                  disabled={isChangingStatus}
                  onClick={() =>
                    handleChangeStatus(selectedIdList, 'CONFIRMED')
                  }
                />
                <TableFooterAction
                  text="취소"
                  icon={<Trash />}
                  disabled={isChangingStatus}
                  onClick={() => handleChangeStatus(selectedIdList, 'CANCELED')}
                />
                <SmallButton
                  text="문자"
                  onClick={() => setIsSmsModalOpen(true)}
                />
                <div className="flex items-center gap-20 mobile:gap-12">
                  <p className="text-body1r text-gray-400">출력</p>
                  <SmallButton text="Excel" onClick={handleExportCsv} />
                </div>
              </>
            }
          >
            {totalPage > 1 && (
              <div className="flex justify-center">
                <NavigationBar totalPage={totalPage} />
              </div>
            )}
          </ApplicationTable>
        </div>

        {isSmsModalOpen && (
          <GroupSmsModal
            selectedRows={selectedRows}
            filteredRows={filteredRows}
            onClose={() => setIsSmsModalOpen(false)}
            onSent={() => setSelectedIds(new Set())}
          />
        )}
      </div>
    ),
  });
};

export default ApplicationLedger;
