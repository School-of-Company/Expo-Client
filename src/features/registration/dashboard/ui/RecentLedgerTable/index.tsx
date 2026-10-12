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
} from '../../../common/model/ledger';

const COLUMNS: TableColumn<LedgerRow>[] = [
  {
    key: 'createdAt',
    label: '신청일시',
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    key: 'name',
    label: '이름',
    render: (row) => <span className="text-black">{row.name}</span>,
  },
  {
    key: 'program',
    label: '회차',
    flex: 2,
    render: (row) => (
      <>
        <p className="truncate text-black">{row.title}</p>
        <p className="text-caption2r">
          {formatDefinitionSchedule(row.startedAt, row.endedAt)}
        </p>
      </>
    ),
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

const RecentLedgerTable = ({ rows }: { rows: LedgerRow[] }) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows}
    emptyText="아직 신청이 없습니다."
    footerText="최근 신청"
    footerCount={rows.length}
    maxHeight="none"
    minWidth="700px"
  />
);

export default RecentLedgerTable;
