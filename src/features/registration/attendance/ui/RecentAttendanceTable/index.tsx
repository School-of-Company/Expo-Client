import { RegistrationTable, StatusBadge, TableColumn } from '../../../common';
import { EntryRecord } from '../../api/getAttendanceActivity';
import { getEntryMethodLabel } from '../../model/attendanceActivity';

// 시간대 없는 지역 일시 → 10.31 14:05:12
const formatRecordTime = (at: string) => {
  const [date, time = ''] = at.split('T');
  const [, month, day] = date.split('-');
  return `${Number(month)}.${day} ${time.slice(0, 8)}`;
};

const TYPE_BADGE = {
  ENTER: <StatusBadge tone="main">입장</StatusBadge>,
  EXIT: <StatusBadge tone="gray">퇴장</StatusBadge>,
  CANCEL: <StatusBadge tone="gray">입장 취소</StatusBadge>,
};

// 기록에 ID 가 없어 표 행 키를 만든다
type RecordRow = EntryRecord & { id: string };

const COLUMNS: TableColumn<RecordRow>[] = [
  {
    key: 'at',
    label: '시각',
    flex: 1.2,
    render: (row) => formatRecordTime(row.at),
  },
  {
    key: 'type',
    label: '구분',
    flex: 0.7,
    render: (row) => TYPE_BADGE[row.type],
  },
  {
    key: 'method',
    label: '입장 방식',
    flex: 1.6,
    render: getEntryMethodLabel,
  },
  {
    key: 'name',
    label: '참가자',
    render: (row) => row.name ?? '—',
  },
  {
    key: 'scanner',
    label: '스캐너',
    flex: 1.4,
    render: (row) => row.scanner ?? '—',
  },
];

/** 최신 입·퇴장 기록 30건 */
const RecentAttendanceTable = ({ rows }: { rows: EntryRecord[] }) => (
  <RegistrationTable
    columns={COLUMNS}
    rows={rows.map((row, index) => ({ ...row, id: `${row.at}-${index}` }))}
    emptyText="입·퇴장 기록이 없습니다."
    footerText="최근 기록"
    footerCount={rows.length}
    maxHeight="420px"
    minWidth="640px"
  />
);

export default RecentAttendanceTable;
