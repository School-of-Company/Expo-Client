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
} from '../../../common/model/ledger';

const COLUMNS: TableColumn<LedgerRow>[] = [
  {
    key: 'name',
    label: '이름',
    flex: 1.2,
    render: (row) =>
      row.isParticipantMissing ? (
        <p className="text-gray-400">참가자 정보 없음</p>
      ) : (
        <>
          <p className="truncate text-black">{row.name}</p>
          <p className="text-caption2r">
            {row.isRepresentative ? '대표' : '동행'}
            {row.occupation && ` · ${OCCUPATION_LABEL[row.occupation]}`}
          </p>
          {/* 연수 연결은 직업과 섞지 않고 따로 표시한다 */}
          {row.linkedTraineeId !== null && (
            <p className="text-caption2r text-main-600">연수 연결</p>
          )}
        </>
      ),
  },
  {
    key: 'phone',
    label: '개인 번호 / 대표 수신 번호',
    flex: 1.5,
    // 두 번호를 구분해 보여 주고, 없는 번호를 다른 번호로 채워 발송 가능한 것처럼 보이게 하지 않는다
    render: (row) => (
      <>
        <p className={row.phoneNumber ? 'text-black' : 'text-gray-300'}>
          {row.phoneNumber ?? '개인 번호 없음'}
        </p>
        <p className="text-caption2r">
          {row.notificationPhoneNumber
            ? `수신 ${row.notificationPhoneNumber}`
            : '수신 번호 없음'}
        </p>
      </>
    ),
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
  onRowClick: (row: LedgerRow) => void;
  footerActions: ReactNode;
  children: ReactNode;
}

const LedgerTable = ({
  rows,
  totalCount,
  selectedIds,
  onToggle,
  onTogglePage,
  onRowClick,
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
    onRowClick={onRowClick}
  >
    {children}
  </RegistrationTable>
);

export default LedgerTable;
