'use client';

import { useEffect, useState } from 'react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { RegistrationSelect } from '../../../common';
import {
  AdminApplicationSort,
  AdminApplicationStatus,
  AdminOccupation,
  ProgramSessionDefinition,
} from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LedgerFilter,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
  Q_MAX_LENGTH,
  toSessionKey,
} from '../../../common/model/ledger';

interface LedgerFiltersProps {
  filter: LedgerFilter;
  sessions: ProgramSessionDefinition[];
  onChange: (filter: LedgerFilter) => void;
  onReset: () => void;
}

// 검색어는 서버로 가므로 입력을 멈춘 뒤에 반영한다
const SEARCH_DEBOUNCE_MS = 300;

const LedgerFilters = ({
  filter,
  sessions,
  onChange,
  onReset,
}: LedgerFiltersProps) => {
  const update = (patch: Partial<LedgerFilter>) =>
    onChange({ ...filter, ...patch });
  const [keyword, setKeyword] = useState(filter.q);

  // 초기화처럼 바깥에서 검색어가 바뀌면 입력칸도 맞춘다
  useEffect(() => setKeyword(filter.q), [filter.q]);

  useEffect(() => {
    if (keyword === filter.q) return undefined;
    const timer = setTimeout(
      () => onChange({ ...filter, q: keyword }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [keyword, filter, onChange]);

  return (
    <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
      <SearchInput
        placeholder="참가자 이름·번호로 검색"
        value={keyword}
        onChange={(value) => setKeyword(value.slice(0, Q_MAX_LENGTH))}
      />
      <RegistrationSelect
        ariaLabel="회차"
        value={filter.session}
        onChange={(session) => update({ session })}
        options={[
          { value: '', label: '전체 회차' },
          ...sessions.map((session) => ({
            value: toSessionKey(session),
            label: `[${PROGRAM_TYPE_LABEL[session.programType]}] ${session.title} · ${formatDefinitionSchedule(session.startedAt, session.endedAt)}`,
          })),
        ]}
      />
      <RegistrationSelect
        ariaLabel="상태"
        value={filter.status}
        onChange={(status) =>
          update({ status: status as AdminApplicationStatus | '' })
        }
        options={[
          { value: '', label: '전체 상태' },
          ...Object.entries(LEDGER_STATUS_LABEL).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
      />
      <RegistrationSelect
        ariaLabel="직업"
        value={filter.occupation}
        onChange={(occupation) =>
          update({ occupation: occupation as AdminOccupation | '' })
        }
        options={[
          { value: '', label: '전체 직업' },
          ...Object.entries(OCCUPATION_LABEL).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
      />
      <RegistrationSelect
        ariaLabel="정렬"
        value={filter.sort}
        onChange={(sort) => update({ sort: sort as AdminApplicationSort })}
        options={[
          { value: 'CREATED_DESC', label: '최근 신청순' },
          { value: 'CREATED_ASC', label: '오래된 신청순' },
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
  );
};

export default LedgerFilters;
