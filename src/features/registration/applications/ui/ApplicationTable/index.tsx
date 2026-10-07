import { ReactNode } from 'react';
import {
  ApplicationRow,
  APPLY_TYPE_LABEL,
  formatSessionTime,
  formatShortDate,
  PARTICIPANT_TYPE_LABEL,
  RegistrationTable,
  SessionStat,
  STATUS_LABEL,
  STATUS_TEXT_STYLE,
  TableColumn,
} from '../../../common';
import { SortKey, SortState } from '../../model/applicationFilter';

interface ApplicationTableProps {
  rows: ApplicationRow[];
  totalCount: number;
  sessionStats: Map<number, SessionStat>;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  sort: SortState;
  onSort: (key: SortKey) => void;
  onChangeStatus: (ids: number[], status: 'CONFIRMED' | 'CANCELED') => void;
  isChangingStatus: boolean;
  footerActions: ReactNode;
  children: ReactNode;
}

const ApplicationTable = ({
  rows,
  totalCount,
  sessionStats,
  selectedIds,
  onToggle,
  onToggleAll,
  sort,
  onSort,
  onChangeStatus,
  isChangingStatus,
  footerActions,
  children,
}: ApplicationTableProps) => {
  const columns: TableColumn<ApplicationRow>[] = [
    {
      key: 'id',
      label: '번호',
      flex: 0.6,
      sortKey: 'id',
      render: (row) => row.id,
    },
    {
      key: 'name',
      label: '이름',
      sortKey: 'name',
      render: (row) => (
        <>
          <p className="truncate text-black">{row.name}</p>
          {row.grade && <p className="text-caption2r">{row.grade}</p>}
        </>
      ),
    },
    {
      key: 'phone',
      label: '연락처',
      flex: 1.4,
      render: (row) =>
        row.phoneNumber || (
          <span title="개인 연락처가 없어 인증에 사용한 대표 번호로 발송합니다.">
            {row.verifiedPhoneNumber}
            <span className="text-caption2r"> (대표)</span>
          </span>
        ),
    },
    {
      key: 'affiliation',
      label: '소속',
      flex: 1.3,
      render: (row) => (
        <>
          <p className="truncate">{row.affiliation || '-'}</p>
          <p className="text-caption2r">
            {PARTICIPANT_TYPE_LABEL[row.participantType]}
          </p>
        </>
      ),
    },
    {
      key: 'program',
      label: '프로그램',
      flex: 1.6,
      sortKey: 'program',
      render: (row) => (
        <>
          <p className="truncate text-black">{row.program.name}</p>
          <p className="truncate text-caption2r">
            {row.session.name} · {APPLY_TYPE_LABEL[row.applyType]}
          </p>
        </>
      ),
    },
    {
      key: 'schedule',
      label: '일시',
      flex: 1.2,
      sortKey: 'schedule',
      render: (row) => (
        <>
          <p>{formatShortDate(row.session.date)}</p>
          <p className="text-caption2r">{formatSessionTime(row.session)}</p>
        </>
      ),
    },
    {
      key: 'capacity',
      label: '확정 / 정원',
      render: (row) => {
        const stat = sessionStats.get(row.sessionId);
        return (
          <>
            <p>
              {stat?.confirmed ?? 0} / {row.session.capacity}
            </p>
            {stat?.waiting ? (
              <p className="text-caption2r">대기 {stat.waiting}</p>
            ) : null}
          </>
        );
      },
    },
    {
      key: 'status',
      label: '상태',
      flex: 0.7,
      sortKey: 'status',
      render: (row) => (
        <span className={STATUS_TEXT_STYLE[row.status]}>
          {STATUS_LABEL[row.status]}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '관리',
      render: (row) => (
        <div className="flex justify-center gap-12 text-caption1b">
          {row.status === 'WAITING' && (
            <button
              type="button"
              disabled={isChangingStatus}
              onClick={() => onChangeStatus([row.id], 'CONFIRMED')}
              className="text-main-600"
            >
              승급
            </button>
          )}
          {row.status !== 'CANCELED' && (
            <button
              type="button"
              disabled={isChangingStatus}
              onClick={() => onChangeStatus([row.id], 'CANCELED')}
              className="text-gray-400"
            >
              취소
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <RegistrationTable
      columns={columns}
      rows={rows}
      emptyText="조건에 맞는 신청 내역이 없습니다."
      footerText="검색 결과"
      footerCount={totalCount}
      footerActions={footerActions}
      maxHeight="none"
      minWidth="1100px"
      selectedIds={selectedIds}
      onToggleRow={onToggle}
      onToggleAll={onToggleAll}
      sort={sort}
      onSort={(key) => onSort(key as SortKey)}
    >
      {children}
    </RegistrationTable>
  );
};

export default ApplicationTable;
