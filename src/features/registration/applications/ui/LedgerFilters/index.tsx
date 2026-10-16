'use client';

import { useEffect, useState } from 'react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { formatDateWithWeekday, RegistrationSelect } from '../../../common';
import {
  AdminApplicationSort,
  AdminOccupation,
  ProgramSessionDefinition,
} from '../../../common/api/ledgerApi';
import {
  ACTIVE_STATUS_FILTER,
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LedgerFilter,
  LedgerStatusFilter,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
  Q_MAX_LENGTH,
  SEARCH_MAX_LENGTH,
  toSessionKey,
} from '../../../common/model/ledger';

const SORT_OPTIONS: { value: AdminApplicationSort; label: string }[] = [
  { value: 'CREATED_DESC', label: '최근 신청순' },
  { value: 'CREATED_ASC', label: '오래된 신청순' },
  { value: 'RECEIPT_ASC', label: '접수번호 오름차순' },
  { value: 'RECEIPT_DESC', label: '접수번호 내림차순' },
  { value: 'PROGRAM_ASC', label: '프로그램 가나다순' },
  { value: 'PROGRAM_DESC', label: '프로그램 역순' },
  { value: 'SESSION_ASC', label: '회차 일시 빠른순' },
  { value: 'SESSION_DESC', label: '회차 일시 늦은순' },
];

interface LedgerFiltersProps {
  filter: LedgerFilter;
  sessions: ProgramSessionDefinition[];
  onChange: (filter: LedgerFilter) => void;
  /** 박람회 기간의 날짜 (YYYY-MM-DD) */
  expoDays?: string[];
  onReset: () => void;
}

// 검색어는 서버로 가므로 입력을 멈춘 뒤에 반영한다
const SEARCH_DEBOUNCE_MS = 300;

const LedgerFilters = ({
  filter,
  sessions,
  onChange,
  expoDays = [],
  onReset,
}: LedgerFiltersProps) => {
  const update = (patch: Partial<LedgerFilter>) =>
    onChange({ ...filter, ...patch });
  const [keyword, setKeyword] = useState(filter.q);
  const [title, setTitle] = useState(filter.search);

  // 초기화처럼 바깥에서 검색어가 바뀌면 입력칸도 맞춘다
  useEffect(() => setKeyword(filter.q), [filter.q]);
  useEffect(() => setTitle(filter.search), [filter.search]);

  useEffect(() => {
    if (keyword === filter.q && title === filter.search) return undefined;
    const timer = setTimeout(
      () => onChange({ ...filter, q: keyword, search: title }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [keyword, title, filter, onChange]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 items-center gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
        <div className="col-span-2 mobile:col-span-1">
          <SearchInput
            label="참가자 이름·연락처 검색"
            placeholder="이름·연락처"
            value={keyword}
            onChange={(value) => setKeyword(value.slice(0, Q_MAX_LENGTH))}
          />
        </div>
        <div className="col-span-2 mobile:col-span-1">
          <SearchInput
            label="제출 당시 제목 검색"
            placeholder="제출 당시 제목으로 검색"
            value={title}
            onChange={(value) => setTitle(value.slice(0, SEARCH_MAX_LENGTH))}
          />
        </div>
        <div className="col-span-2 mobile:col-span-1">
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
        </div>
        <RegistrationSelect
          ariaLabel="상태"
          value={filter.status}
          onChange={(status) =>
            update({ status: status as LedgerStatusFilter })
          }
          options={[
            { value: '', label: '전체 상태' },
            { value: ACTIVE_STATUS_FILTER, label: '확정+대기' },
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
          ariaLabel="행사일"
          value={filter.eventDate}
          onChange={(eventDate) => update({ eventDate })}
          options={[
            { value: '', label: '전체 행사일' },
            ...expoDays.map((day) => ({
              value: day,
              label: formatDateWithWeekday(day),
            })),
          ]}
        />
        <RegistrationSelect
          ariaLabel="정렬"
          value={filter.sort}
          onChange={(sort) => update({ sort: sort as AdminApplicationSort })}
          options={SORT_OPTIONS}
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

export default LedgerFilters;
