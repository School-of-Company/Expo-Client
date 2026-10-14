import { ReactNode } from 'react';
import {
  formatDateTime,
  RegistrationTable,
  StatusBadge,
  TableColumn,
} from '../../../common';
import { AdminApplicationSort } from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
} from '../../../common/model/ledger';
import {
  APPLICATION_TYPE_LABEL,
  APPLICATION_TYPE_TONE,
  LEDGER_STATUS_TONE,
  LedgerViewRow,
} from '../../model/ledgerView';

const SORT_KEY = 'createdAt';

const COLUMNS: TableColumn<LedgerViewRow>[] = [
  {
    key: 'receiptNumber',
    // 접수번호는 예시 값이다. 표 위 안내에 예시 데이터 배지를 붙인다
    label: '접수번호*',
    flex: 0.9,
    render: (row) => (
      <p className="truncate text-caption1r text-gray-400">
        {row.receiptNumber || '-'}
      </p>
    ),
  },
  {
    key: 'name',
    label: '이름',
    flex: 1,
    render: (row) => (
      <>
        <p className="truncate text-black">{row.name}</p>
        <p className="text-caption2r">
          {row.isRepresentative ? '대표' : '동행'}
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
    flex: 1.4,
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
    key: 'affiliation',
    label: '소속/유형*',
    flex: 1.2,
    render: (row) => (
      <>
        <p className="truncate text-black">
          {row.occupation ? OCCUPATION_LABEL[row.occupation] : '-'}
        </p>
        {/* 학교는 예시 값이다 */}
        <p className="truncate text-caption2r text-gray-400">
          {row.school ?? '-'}
        </p>
      </>
    ),
  },
  {
    key: 'program',
    label: '회차/구분',
    flex: 1.8,
    render: (row) => (
      <>
        <p className="truncate text-black">{row.title}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <StatusBadge tone="gray">
            {PROGRAM_TYPE_LABEL[row.programType]}
          </StatusBadge>
          {row.applicationType && (
            <StatusBadge tone={APPLICATION_TYPE_TONE[row.applicationType]}>
              {APPLICATION_TYPE_LABEL[row.applicationType]}
            </StatusBadge>
          )}
        </div>
      </>
    ),
  },
  {
    key: 'schedule',
    label: '일시',
    flex: 1.3,
    render: (row) => (
      <p className="text-caption1r">
        {formatDefinitionSchedule(row.startedAt, row.endedAt)}
      </p>
    ),
  },
  {
    key: 'capacity',
    label: '정원현황',
    flex: 1,
    // 현재 회차가 아니면 정원을 알 수 없다
    render: ({ capacity }) =>
      capacity ? (
        <>
          <p className="text-black">
            확정 {capacity.confirmed}/{capacity.capacity}
          </p>
          <p
            className={`text-caption2r ${capacity.confirmed >= capacity.capacity ? 'text-error' : 'text-main-600'}`}
          >
            공석 {Math.max(capacity.capacity - capacity.confirmed, 0)}석
          </p>
        </>
      ) : (
        <p className="text-gray-300">-</p>
      ),
  },
  {
    key: SORT_KEY,
    label: '신청일시',
    flex: 1.1,
    sortKey: SORT_KEY,
    render: (row) => (
      <p className="text-caption1r">{formatDateTime(row.createdAt)}</p>
    ),
  },
  {
    key: 'status',
    label: '상태',
    flex: 0.7,
    render: (row) => (
      <StatusBadge tone={LEDGER_STATUS_TONE[row.status]}>
        {LEDGER_STATUS_LABEL[row.status]}
      </StatusBadge>
    ),
  },
];

interface LedgerTableProps {
  rows: LedgerViewRow[];
  totalCount: number;
  sort: AdminApplicationSort;
  onSortChange: (sort: AdminApplicationSort) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onTogglePage: () => void;
  onRowClick: (row: LedgerViewRow) => void;
  footerActions?: ReactNode;
  children: ReactNode;
}

const LedgerTable = ({
  rows,
  totalCount,
  sort,
  onSortChange,
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
    minWidth="1120px"
    selectedIds={selectedIds}
    onToggleRow={onToggle}
    onToggleAll={onTogglePage}
    onRowClick={onRowClick}
    // 서버는 신청일시 정렬만 지원한다
    sort={{
      key: SORT_KEY,
      direction: sort === 'CREATED_ASC' ? 'asc' : 'desc',
    }}
    onSort={() =>
      onSortChange(sort === 'CREATED_ASC' ? 'CREATED_DESC' : 'CREATED_ASC')
    }
  >
    {children}
  </RegistrationTable>
);

export default LedgerTable;
