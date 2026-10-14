'use client';

import { MockDataBadge } from '@/shared/ui';
import { DateTimeInput, RegistrationSelect } from '../../../common';
import { AdminApplicationAction } from '../../api/applicationActivityApi';
import { ACTIVITY_MOCK_ISSUE } from '../../mock/applicationActivityMock';
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

      {/* 서버가 아직 이 조건을 받지 않는다. 불러온 행만 거르면 결과를 오해할 수 있어 막아 둔다 */}
      <fieldset
        disabled
        className="space-y-8 rounded-sm border-1 border-dashed border-gray-200 px-16 py-12"
      >
        <legend className="flex items-center gap-8 px-4">
          <span className="text-caption1r text-gray-400">
            서버 지원 후 사용할 수 있는 조건
          </span>
          <MockDataBadge issue={ACTIVITY_MOCK_ISSUE} />
        </legend>
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-12 opacity-50 mobile:grid-cols-1 tablet:grid-cols-2">
          <input
            aria-label="검색"
            placeholder="이름·연락처·학교·소속·메모"
            className="w-full rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-12 text-body2r outline-none"
          />
          <RegistrationSelect
            ariaLabel="처리주체"
            value=""
            onChange={() => {}}
            options={[{ value: '', label: '처리주체 전체' }]}
          />
          <RegistrationSelect
            ariaLabel="프로그램"
            value=""
            onChange={() => {}}
            options={[{ value: '', label: '프로그램 전체' }]}
          />
          <RegistrationSelect
            ariaLabel="변경 후 상태"
            value=""
            onChange={() => {}}
            options={[{ value: '', label: '변경 후 상태 전체' }]}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default ApplicationActivityFilters;
