import { RegistrationTable, StatusBadge, TableColumn } from '../../../common';
import { AttendanceLog } from '../../mock/attendanceActivity';
import { ATTENDANCE_METHOD_LABEL } from '../../model/attendanceActivity';

// 시간대 없는 지역 일시 → 10.31 14:05:12
const formatLogTime = (occurredAt: string) => {
  const [date, time] = occurredAt.split('T');
  const [, month, day] = date.split('-');
  return `${Number(month)}.${day} ${time.slice(0, 8)}`;
};

const COLUMNS: TableColumn<AttendanceLog>[] = [
  {
    key: 'occurredAt',
    label: '시각',
    flex: 1.2,
    render: (row) => formatLogTime(row.occurredAt),
  },
  {
    key: 'type',
    label: '구분',
    flex: 0.6,
    render: (row) =>
      row.type === 'ENTRY' ? (
        <StatusBadge tone="main">입장</StatusBadge>
      ) : (
        <StatusBadge tone="gray">퇴장</StatusBadge>
      ),
  },
  {
    key: 'method',
    label: '입장 방식',
    flex: 1.6,
    render: (row) => ATTENDANCE_METHOD_LABEL[row.method],
  },
  {
    key: 'participant',
    label: '참가자',
    render: (row) => row.participantName ?? '—',
  },
  {
    key: 'scanner',
    label: '스캐너',
    flex: 1.4,
    render: (row) => row.scannerName,
  },
];

/** 최신 입·퇴장 기록 30건 */
const RecentAttendanceTable = ({ rows }: { rows: AttendanceLog[] }) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows}
    emptyText="입·퇴장 기록이 없습니다."
    footerText="최근 기록"
    footerCount={rows.length}
    maxHeight="420px"
    minWidth="640px"
  />
);

export default RecentAttendanceTable;
