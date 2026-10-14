import {
  formatDateTime,
  maskPhoneNumber,
  RegistrationTable,
  StatusBadge,
  StatusBadgeTone,
  TableColumn,
} from '../../../common';
import { AdminApplicationStatus } from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LedgerRow,
  OCCUPATION_LABEL,
} from '../../../common/model/ledger';

const STATUS_TONE: Record<AdminApplicationStatus, StatusBadgeTone> = {
  CONFIRMED: 'main',
  WAITING: 'outline',
  CANCELLED: 'error',
};

const COLUMNS: TableColumn<LedgerRow>[] = [
  {
    key: 'receiptNumber',
    label: '접수번호',
    flex: 0.7,
    render: ({ receiptNumber }) => `#${receiptNumber}`,
  },
  {
    key: 'participant',
    label: '참가자',
    render: ({ name, phoneNumber }) => (
      <>
        <p className="truncate text-black">{name}</p>
        <p className="text-caption2r">
          {phoneNumber ? maskPhoneNumber(phoneNumber) : '-'}
        </p>
      </>
    ),
  },
  {
    key: 'occupation',
    label: '직업',
    render: ({ occupation }) =>
      occupation ? OCCUPATION_LABEL[occupation] : '-',
  },
  {
    key: 'program',
    label: '신청 프로그램',
    flex: 2,
    render: ({ title, startedAt, endedAt }) => (
      <>
        <p className="truncate text-black">{title}</p>
        <p className="text-caption2r">
          {formatDefinitionSchedule(startedAt, endedAt)}
        </p>
      </>
    ),
  },
  {
    key: 'status',
    label: '상태',
    flex: 0.6,
    render: ({ status }) => (
      <StatusBadge tone={STATUS_TONE[status]}>
        {LEDGER_STATUS_LABEL[status]}
      </StatusBadge>
    ),
  },
  {
    key: 'createdAt',
    label: '신청 일시',
    render: ({ createdAt }) => formatDateTime(createdAt),
  },
];

/** 최근 접수 */
const RecentLedgerTable = ({ rows }: { rows: LedgerRow[] }) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows}
    emptyText="아직 신청이 없습니다."
    footerText="최근 신청"
    footerCount={rows.length}
    maxHeight="none"
    minWidth="840px"
  />
);

export default RecentLedgerTable;
