import { ReactNode } from 'react';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';

export interface TableColumn<T> {
  key: string;
  label: string;
  /** 열 너비 비율 (flex-grow). 기본 1 */
  flex?: number;
  /** 지정하면 헤더를 눌러 정렬할 수 있다 */
  sortKey?: string;
  render: (row: T) => ReactNode;
}

interface RegistrationTableProps<T extends { id: number }> {
  columns: TableColumn<T>[];
  rows: T[];
  emptyText: string;
  footerText: string;
  footerCount: number;
  footerActions?: ReactNode;
  maxHeight?: string;
  minWidth?: string;
  selectedIds?: Set<number>;
  onToggleRow?: (id: number) => void;
  onToggleAll?: () => void;
  onRowClick?: (row: T) => void;
  sort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
  children?: ReactNode;
}

const CELL = 'min-w-0 px-4 text-center';

/** shared TableForm 과 같은 모양에 다중 선택·정렬·커스텀 셀을 더한 표 */
const RegistrationTable = <T extends { id: number }>({
  columns,
  rows,
  emptyText,
  footerText,
  footerCount,
  footerActions,
  maxHeight = '500px',
  minWidth = '800px',
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
  sort,
  onSort,
  children,
}: RegistrationTableProps<T>) => {
  const isSelectable = Boolean(selectedIds && onToggleRow);
  const isAllSelected =
    rows.length > 0 && rows.every(({ id }) => selectedIds?.has(id));

  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
      <div className="overflow-x-auto border-b-1 border-solid border-gray-100 pb-6">
        <div style={{ minWidth }}>
          <div className="flex items-center border-b-1 border-solid border-gray-100 py-26">
            {isSelectable && (
              <button
                type="button"
                aria-label="전체 선택"
                className="flex w-[48px] flex-none justify-center"
                onClick={onToggleAll}
              >
                {isAllSelected ? <CheckedBoxIcon /> : <CheckBoxIcon />}
              </button>
            )}
            {columns.map((column) => (
              <div
                key={column.key}
                className={CELL}
                style={{ flex: column.flex ?? 1 }}
              >
                {column.sortKey && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.sortKey!)}
                    className={`text-caption1b ${sort?.key === column.sortKey ? 'text-main-600' : 'text-gray-500'}`}
                  >
                    {column.label}
                    {sort?.key === column.sortKey &&
                      (sort.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ) : (
                  <p className="text-caption1b text-gray-500">{column.label}</p>
                )}
              </div>
            ))}
          </div>

          <div
            className="space-y-20 overflow-y-auto pt-6"
            style={{ maxHeight }}
          >
            {rows.length === 0 && (
              <p className="py-40 text-center text-body2r text-gray-400">
                {emptyText}
              </p>
            )}
            {rows.map((row) => {
              const isSelected = selectedIds?.has(row.id) ?? false;
              return (
                <div
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`flex w-full items-center rounded-sm border-1 border-solid border-gray-200 py-8 text-body2r text-gray-500 ${
                    isSelected ? 'bg-main-100' : 'bg-white'
                  } ${onRowClick ? 'cursor-pointer hover:bg-main-100' : ''}`}
                >
                  {isSelectable && (
                    <button
                      type="button"
                      aria-label={`${row.id} 선택`}
                      className="flex w-[48px] flex-none justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRow!(row.id);
                      }}
                    >
                      {isSelected ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    </button>
                  )}
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={CELL}
                      style={{ flex: column.flex ?? 1 }}
                    >
                      {column.render(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {children}

      <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-start">
        <div className="flex gap-20 mobile:gap-12">
          <p className="text-body2r text-gray-500 mobile:text-caption1r">
            {footerText}
          </p>
          <p className="text-body2r text-main-600 mobile:text-caption1r">
            {footerCount}
          </p>
        </div>
        {footerActions && (
          <div className="flex flex-wrap items-center gap-20 mobile:gap-12">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationTable;
