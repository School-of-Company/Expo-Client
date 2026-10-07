import {
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';
import { SearchInput } from '@/shared/ui/SearchInput';
import SelectUserType from '@/shared/ui/SelectUserType';
import {
  APPLY_TYPE_LABEL,
  formatDateWithWeekday,
  RegistrationSelect,
} from '../../../common';
import {
  ApplicationFilter,
  StatusFilter,
  STATUS_FILTER_OPTIONS,
} from '../../model/applicationFilter';

interface ApplicationFiltersProps {
  filter: ApplicationFilter;
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  onChange: (filter: ApplicationFilter) => void;
  onReset: () => void;
}

const ApplicationFilters = ({
  filter,
  programs,
  sessions,
  onChange,
  onReset,
}: ApplicationFiltersProps) => {
  const update = (patch: Partial<ApplicationFilter>) =>
    onChange({ ...filter, ...patch });

  const programOptions = [
    { value: '', label: '전체 프로그램' },
    ...programs.map(({ id, name }) => ({ value: String(id), label: name })),
  ];
  const programSessions = filter.programId
    ? sessions.filter(({ programId }) => String(programId) === filter.programId)
    : sessions;
  const programNameById = new Map(programs.map(({ id, name }) => [id, name]));
  const dates = Array.from(new Set(sessions.map(({ date }) => date))).sort();

  const dateButton = (value: string, label: string) => (
    <button
      key={value || 'all'}
      type="button"
      onClick={() => update({ date: value })}
      className={`whitespace-nowrap rounded-sm border-1 border-solid px-16 py-8 text-body2r duration-200 ${
        filter.date === value
          ? 'border-main-600 bg-main-600 text-white'
          : 'border-gray-200 text-gray-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-30">
      <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-start">
        <SelectUserType
          options={programOptions}
          value={filter.programId}
          onChange={(programId) => update({ programId, sessionId: '' })}
        />
        <div className="flex gap-8 overflow-x-auto">
          {dateButton('', '전체 일자')}
          {dates.map((date) => dateButton(date, formatDateWithWeekday(date)))}
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] items-center gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
        <SearchInput
          placeholder="이름, 연락처, 소속으로 검색"
          value={filter.keyword}
          onChange={(keyword) => update({ keyword })}
        />
        <RegistrationSelect
          ariaLabel="회차"
          value={filter.sessionId}
          onChange={(sessionId) => update({ sessionId })}
          options={[
            { value: '', label: '전체 회차' },
            ...programSessions.map((session) => ({
              value: String(session.id),
              label: filter.programId
                ? session.name
                : `${programNameById.get(session.programId)} · ${session.name}`,
            })),
          ]}
        />
        <RegistrationSelect
          ariaLabel="상태"
          value={filter.status}
          onChange={(status) => update({ status: status as StatusFilter })}
          options={STATUS_FILTER_OPTIONS}
        />
        <RegistrationSelect
          ariaLabel="신청구분"
          value={filter.applyType}
          onChange={(applyType) => update({ applyType })}
          options={[
            { value: '', label: '전체 신청구분' },
            ...Object.entries(APPLY_TYPE_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <button
          type="button"
          onClick={onReset}
          className="whitespace-nowrap px-8 text-body2r text-gray-500 underline"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default ApplicationFilters;
