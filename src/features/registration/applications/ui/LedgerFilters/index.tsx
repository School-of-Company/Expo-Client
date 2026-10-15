'use client';

import { useEffect, useState } from 'react';
import { MockDataBadge } from '@/shared/ui';
import { SearchInput } from '@/shared/ui/SearchInput';
import { formatDateWithWeekday, RegistrationSelect } from '../../../common';
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
  SEARCH_MAX_LENGTH,
  toSessionKey,
} from '../../../common/model/ledger';
import { LEDGER_EXTRAS_ISSUE } from '../../mock/ledgerExtras';
import {
  APPLICATION_TYPE_LABEL,
  ApplicationType,
  LedgerClientFilter,
} from '../../model/ledgerView';

interface LedgerFiltersProps {
  filter: LedgerFilter;
  sessions: ProgramSessionDefinition[];
  onChange: (filter: LedgerFilter) => void;
  /** 서버 필터가 없어 현재 페이지 행에만 거는 필터. 넘기면 신청구분·행사일을 보인다 */
  clientFilter?: LedgerClientFilter;
  onClientFilterChange?: (filter: LedgerClientFilter) => void;
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
  clientFilter,
  onClientFilterChange,
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
            placeholder="이름·연락처 (학교·소속 검색은 준비 중)"
            value={keyword}
            onChange={(value) => setKeyword(value.slice(0, Q_MAX_LENGTH))}
          />
        </div>
        <div className="col-span-2 mobile:col-span-1">
          <SearchInput
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
        {clientFilter && onClientFilterChange && (
          <>
            <div className="flex items-center gap-8">
              <RegistrationSelect
                ariaLabel="신청구분"
                value={clientFilter.applicationType}
                onChange={(applicationType) =>
                  onClientFilterChange({
                    ...clientFilter,
                    applicationType: applicationType as ApplicationType | '',
                  })
                }
                options={[
                  { value: '', label: '전체 신청구분' },
                  ...Object.entries(APPLICATION_TYPE_LABEL).map(
                    ([value, label]) => ({
                      value,
                      label,
                    }),
                  ),
                ]}
              />
              <MockDataBadge issue={LEDGER_EXTRAS_ISSUE} />
            </div>
            <div className="flex items-center gap-8">
              <RegistrationSelect
                ariaLabel="행사일"
                value={clientFilter.eventDay}
                onChange={(eventDay) =>
                  onClientFilterChange({ ...clientFilter, eventDay })
                }
                options={[
                  { value: '', label: '전체 행사일' },
                  ...expoDays.map((day) => ({
                    value: day,
                    label: formatDateWithWeekday(day),
                  })),
                ]}
              />
              <MockDataBadge issue={LEDGER_EXTRAS_ISSUE} />
            </div>
          </>
        )}
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
      {clientFilter && (
        <p className="text-caption1r text-gray-400">
          신청구분·행사일은 서버 필터가 준비 중이라 지금 보고 있는 페이지의
          행에만 적용합니다. 건수·그룹 메시지·엑셀의 필터 전체에는 반영되지
          않습니다.
        </p>
      )}
    </div>
  );
};

export default LedgerFilters;
