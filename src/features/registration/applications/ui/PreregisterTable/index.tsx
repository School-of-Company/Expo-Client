import { ReactNode } from 'react';
import {
  formatDateTime,
  RegistrationTable,
  StatusBadge,
  TableColumn,
} from '../../../common';
import { PreregisterSort } from '../../../common/api/preregisterLedgerApi';
import { LEDGER_STATUS_LABEL } from '../../../common/model/ledger';
import { PreregisterRow } from '../../../common/model/preregisterLedger';
import { LEDGER_STATUS_TONE } from '../../model/ledgerView';

const toTableSort = (sort: PreregisterSort) => ({
  key: 'created',
  direction: sort === 'CREATED_ASC' ? ('asc' as const) : ('desc' as const),
});

interface PreregisterTableProps {
  rows: PreregisterRow[];
  totalCount: number;
  sort: PreregisterSort;
  onSortChange: (sort: PreregisterSort) => void;
  /** 회차 ID → 표시 이름 */
  sessionLabel: (sessionId: number) => string;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onTogglePage: () => void;
  onRowClick: (row: PreregisterRow) => void;
  footerActions?: ReactNode;
  children: ReactNode;
}

const PreregisterTable = ({
  rows,
  totalCount,
  sort,
  onSortChange,
  sessionLabel,
  selectedIds,
  onToggle,
  onTogglePage,
  onRowClick,
  footerActions,
  children,
}: PreregisterTableProps) => {
  const columns: TableColumn<PreregisterRow>[] = [
    {
      key: 'representative',
      label: '대표자',
      flex: 1.2,
      render: ({ representative }) => (
        <>
          <p className="truncate text-black">{representative.name}</p>
          <p className="text-caption2r">대표</p>
        </>
      ),
    },
    {
      key: 'companions',
      label: '동행자',
      flex: 1.4,
      // 일행 인원은 대표자 + 동행자이며 인원 집계와 같은 기준이다
      render: ({ companions, applicants }) => (
        <>
          <p className="truncate text-black">
            {companions.length > 0
              ? companions.map(({ name }) => name).join(', ')
              : '없음'}
          </p>
          <p className="text-caption2r">일행 {applicants}명</p>
        </>
      ),
    },
    {
      key: 'phone',
      label: '대표 수신 번호',
      flex: 1.2,
      // 메시지는 대표자 번호로만 가므로 없으면 없다고 보여 준다
      render: ({ representative }) => (
        <p
          className={
            representative.notificationPhoneNumber
              ? 'text-black'
              : 'text-gray-300'
          }
        >
          {representative.notificationPhoneNumber ?? '수신 번호 없음'}
        </p>
      ),
    },
    {
      key: 'session',
      label: '회차',
      flex: 1.6,
      render: ({ sessionId }) => (
        <p className="truncate text-black">{sessionLabel(sessionId)}</p>
      ),
    },
    {
      key: 'createdAt',
      label: '신청일시',
      flex: 1.1,
      sortKey: 'created',
      render: ({ createdAt }) => (
        <p className="text-caption1r">{formatDateTime(createdAt)}</p>
      ),
    },
    {
      key: 'status',
      label: '상태',
      flex: 0.9,
      render: ({ status, waitingPosition }) => (
        <>
          <StatusBadge tone={LEDGER_STATUS_TONE[status]}>
            {LEDGER_STATUS_LABEL[status]}
          </StatusBadge>
          {status === 'WAITING' && waitingPosition !== null && (
            <p className="mt-4 text-caption2r">{waitingPosition}번째</p>
          )}
        </>
      ),
    },
  ];

  return (
    <RegistrationTable
      columns={columns}
      rows={rows}
      emptyText="조건에 맞는 사전등록 신청이 없습니다."
      footerText="검색 결과"
      footerCount={totalCount}
      footerActions={footerActions}
      maxHeight="none"
      minWidth="960px"
      selectedIds={selectedIds}
      onToggleRow={onToggle}
      onToggleAll={onTogglePage}
      onRowClick={onRowClick}
      sort={toTableSort(sort)}
      onSort={() =>
        onSortChange(sort === 'CREATED_ASC' ? 'CREATED_DESC' : 'CREATED_ASC')
      }
    >
      {children}
    </RegistrationTable>
  );
};

export default PreregisterTable;
