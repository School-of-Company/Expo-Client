'use client';

import { useEffect, useState } from 'react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { DateTimeInput, RegistrationSelect } from '../../../common';
import { ProgramSessionDefinition } from '../../../common/api/ledgerApi';
import {
  LEDGER_STATUS_LABEL,
  PROGRAM_TYPE_LABEL,
  toSessionKey,
} from '../../../common/model/ledger';
import { AdminApplicationAction } from '../../api/applicationActivityApi';
import {
  ACTIVITY_ACTION_LABEL,
  ActivityFilter,
  INITIAL_ACTIVITY_FILTER,
  MAX_PARTICIPANT_LENGTH,
} from '../../model/applicationActivity';

// 검색어는 서버로 가므로 입력을 멈춘 뒤에 반영한다
const SEARCH_DEBOUNCE_MS = 300;

interface ApplicationActivityFiltersProps {
  filter: ActivityFilter;
  sessions: ProgramSessionDefinition[];
  onChange: (filter: ActivityFilter) => void;
}

const ApplicationActivityFilters = ({
  filter,
  sessions,
  onChange,
}: ApplicationActivityFiltersProps) => {
  const update = (patch: Partial<ActivityFilter>) =>
    onChange({ ...filter, ...patch });
  const isCancelledOnly = filter.action === 'CANCELLED';
  const [keyword, setKeyword] = useState(filter.participant);

  // 초기화처럼 바깥에서 검색어가 바뀌면 입력칸도 맞춘다
  useEffect(() => setKeyword(filter.participant), [filter.participant]);

  useEffect(() => {
    if (keyword === filter.participant) return undefined;
    const timer = setTimeout(
      () => onChange({ ...filter, participant: keyword }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [keyword, filter, onChange]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-4 items-end gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
        <div className="col-span-2 space-y-6 mobile:col-span-1">
          <p className="text-caption1r text-gray-500">참가자 검색</p>
          <SearchInput
            label="참가자 이름·연락처 검색"
            placeholder="참가자 이름·연락처 (현재 정보)"
            value={keyword}
            onChange={(value) =>
              setKeyword(value.slice(0, MAX_PARTICIPANT_LENGTH))
            }
          />
        </div>
        <div className="col-span-2 space-y-6 mobile:col-span-1">
          <p className="text-caption1r text-gray-500">프로그램·회차</p>
          <RegistrationSelect
            ariaLabel="프로그램·회차"
            value={filter.session}
            onChange={(session) => update({ session })}
            options={[
              { value: '', label: '전체 프로그램' },
              ...sessions.map((session) => ({
                value: toSessionKey(session),
                label: `[${PROGRAM_TYPE_LABEL[session.programType]}] ${session.title}`,
              })),
            ]}
          />
        </div>
        <div className="space-y-6">
          <p className="text-caption1r text-gray-500">처리 후 상태</p>
          <RegistrationSelect
            ariaLabel="처리 후 상태"
            value={filter.status}
            onChange={(status) => update({ status })}
            options={[
              { value: '', label: '전체' },
              ...Object.entries(LEDGER_STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </div>
      </div>
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
