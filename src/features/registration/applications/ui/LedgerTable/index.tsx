import { ReactNode } from 'react';
import {
  formatDateTime,
  RegistrationTable,
  TableColumn,
} from '../../../common';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  LedgerRow,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
} from '../../model/ledger';

const COLUMNS: TableColumn<LedgerRow>[] = [
  {
    key: 'name',
    label: '이름',
    render: (row) => (
      <>
        <p className="truncate text-black">{row.name}</p>
        {row.occupation && (
          <p className="text-caption2r">{OCCUPATION_LABEL[row.occupation]}</p>
        )}
      </>
    ),
  },
  {
    key: 'phone',
    label: '연락처',
    flex: 1.3,
    // 개인 번호가 없을 때 알림 번호를 보여 주되, 개인 번호인 것처럼 섞지 않는다
    render: (row) =>
      row.phoneNumber ??
      (row.notificationPhoneNumber ? (
        <span title="개인 번호가 없어 알림 받는 번호를 표시합니다.">
          {row.notificationPhoneNumber}
          <span className="text-caption2r"> (알림)</span>
        </span>
      ) : (
        '-'
      )),
  },
  {
    key: 'program',
    label: '회차',
    flex: 2,
    render: (row) => (
      <>
        <p className="truncate text-black">{row.title}</p>
        <p className="text-caption2r">
          {PROGRAM_TYPE_LABEL[row.programType]} ·{' '}
          {formatDefinitionSchedule(row.startedAt, row.endedAt)}
        </p>
      </>
    ),
  },
  {
    key: 'createdAt',
    label: '신청일시',
    flex: 1.1,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    key: 'status',
    label: '상태',
    flex: 0.6,
    render: (row) => (
      <span className={LEDGER_STATUS_STYLE[row.status]}>
        {LEDGER_STATUS_LABEL[row.status]}
      </span>
    ),
  },
];

interface LedgerTableProps {
  rows: LedgerRow[];
  totalCount: number;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onTogglePage: () => void;
  footerActions: ReactNode;
  children: ReactNode;
}

const LedgerTable = ({
  rows,
  totalCount,
  selectedIds,
  onToggle,
  onTogglePage,
  footerActions,
  children,
}: LedgerTableProps) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows}
    emptyText="조건에 맞는 신청 내역이 없습니다."
    footerText="검색 결과"
    footerCount={totalCount}
    footerActions={footerActions}
    maxHeight="none"
    minWidth="900px"
    selectedIds={selectedIds}
    onToggleRow={onToggle}
    onToggleAll={onTogglePage}
  >
    {children}
  </RegistrationTable>
);

export default LedgerTable;
