import {
  ApplicationRow,
  formatDateTime,
  formatShortDate,
  maskPhoneNumber,
  PARTICIPANT_TYPE_LABEL,
  RegistrationTable,
  STATUS_LABEL,
  STATUS_TEXT_STYLE,
  TableColumn,
} from '../../../common';

const COLUMNS: TableColumn<ApplicationRow>[] = [
  { key: 'id', label: '번호', flex: 0.6, render: (row) => row.id },
  {
    key: 'name',
    label: '이름',
    render: (row) => <span className="text-black">{row.name}</span>,
  },
  {
    key: 'phone',
    label: '연락처',
    flex: 1.3,
    render: (row) => maskPhoneNumber(row.contactNumber),
  },
  {
    key: 'type',
    label: '구분',
    render: (row) => PARTICIPANT_TYPE_LABEL[row.participantType],
  },
  {
    key: 'program',
    label: '프로그램',
    flex: 2,
    render: (row) => (
      <p className="truncate">
        {row.program.name} · {formatShortDate(row.session.date)}{' '}
        {row.session.startTime}
      </p>
    ),
  },
  {
    key: 'status',
    label: '상태',
    flex: 0.7,
    render: (row) => (
      <span className={STATUS_TEXT_STYLE[row.status]}>
        {STATUS_LABEL[row.status]}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: '신청 일시',
    flex: 1.3,
    render: (row) => formatDateTime(row.createdAt),
  },
];

const RecentApplicationTable = ({ rows }: { rows: ApplicationRow[] }) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows}
    emptyText="접수 내역이 없습니다."
    footerText="최근 접수"
    footerCount={rows.length}
    maxHeight="none"
  />
);

export default RecentApplicationTable;
