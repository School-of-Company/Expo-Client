'use client';

import { DateTimeInput, RegistrationSelect } from '../../../common';
import { AdminApplicationAction } from '../../api/applicationActivityApi';
import {
  ACTIVITY_ACTION_LABEL,
  ActivityFilter,
  INITIAL_ACTIVITY_FILTER,
} from '../../model/applicationActivity';

interface ApplicationActivityFiltersProps {
  filter: ActivityFilter;
  onChange: (filter: ActivityFilter) => void;
}

const ApplicationActivityFilters = ({
  filter,
  onChange,
}: ApplicationActivityFiltersProps) => {
  const update = (patch: Partial<ActivityFilter>) =>
    onChange({ ...filter, ...patch });
  const isCancelledOnly = filter.action === 'CANCELLED';

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)_auto] items-end gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
        <div className="space-y-6">
          <p className="text-caption1r text-gray-500">처리유형</p>
          <RegistrationSelect
            ariaLabel="처리유형"
            value={filter.action}
            onChange={(action) =>
              update({ action: action as AdminApplicationAction | '' })
            }
            options={[
              { value: '', label: '전체' },
              ...Object.entries(ACTIVITY_ACTION_LABEL).map(
                ([value, label]) => ({ value, label }),
              ),
            ]}
          />
        </div>
        <div className="space-y-6">
          <p className="text-caption1r text-gray-500">처리일 시작 (포함)</p>
          <DateTimeInput
            value={filter.from}
            onChange={(from) => update({ from })}
          />
        </div>
        <div className="space-y-6">
          <p className="text-caption1r text-gray-500">처리일 종료 (미포함)</p>
          <DateTimeInput value={filter.to} onChange={(to) => update({ to })} />
        </div>
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => update({ action: 'CANCELLED' })}
            disabled={isCancelledOnly}
            className="whitespace-nowrap rounded-sm border-1 border-solid border-gray-200 px-12 py-12 text-body2r text-gray-500 disabled:border-main-600 disabled:text-main-600"
          >
            취소 이력만 보기
          </button>
          <button
            type="button"
            onClick={() => onChange(INITIAL_ACTIVITY_FILTER)}
            className="whitespace-nowrap px-8 py-12 text-body2r text-gray-500 underline"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationActivityFilters;
