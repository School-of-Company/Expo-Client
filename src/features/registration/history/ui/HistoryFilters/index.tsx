'use client';

import { DateTimeInput, RegistrationSelect } from '../../../common';
import { AdminChangeType } from '../../api/adminChangeHistoryApi';
import {
  CHANGE_TYPE_LABEL,
  HistoryFilter,
} from '../../model/adminChangeHistory';

interface HistoryFiltersProps {
  filter: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
  onReset: () => void;
}

const HistoryFilters = ({ filter, onChange, onReset }: HistoryFiltersProps) => {
  const update = (patch: Partial<HistoryFilter>) =>
    onChange({ ...filter, ...patch });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)_auto] items-end gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
      <RegistrationSelect
        ariaLabel="변경 유형"
        value={filter.type}
        onChange={(type) => update({ type: type as AdminChangeType | '' })}
        options={[
          { value: '', label: '전체 유형' },
          ...Object.entries(CHANGE_TYPE_LABEL).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
      />
      <div className="space-y-6">
        <p className="text-caption1r text-gray-500">시작 (포함)</p>
        <DateTimeInput
          value={filter.from}
          onChange={(from) => update({ from })}
        />
      </div>
      <div className="space-y-6">
        <p className="text-caption1r text-gray-500">종료 (미포함)</p>
        <DateTimeInput value={filter.to} onChange={(to) => update({ to })} />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="whitespace-nowrap px-8 py-12 text-body2r text-gray-500 underline"
      >
        초기화
      </button>
    </div>
  );
};

export default HistoryFilters;
