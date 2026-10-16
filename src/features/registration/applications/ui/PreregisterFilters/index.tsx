'use client';

import { useEffect, useState } from 'react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { RegistrationSelect } from '../../../common';
import { Q_MAX_LENGTH } from '../../../common/model/ledger';
import {
  PREREGISTER_STATUS_FILTERS,
  PreregisterFilter,
} from '../../../common/model/preregisterLedger';

interface PreregisterFiltersProps {
  filter: PreregisterFilter;
  sessions: { value: string; label: string }[];
  onChange: (filter: PreregisterFilter) => void;
  onReset: () => void;
}

// 검색어는 서버로 가므로 입력을 멈춘 뒤에 반영한다
const SEARCH_DEBOUNCE_MS = 300;

const PreregisterFilters = ({
  filter,
  sessions,
  onChange,
  onReset,
}: PreregisterFiltersProps) => {
  const update = (patch: Partial<PreregisterFilter>) =>
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
    <div className="grid grid-cols-4 items-center gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
      <div className="col-span-2 mobile:col-span-1">
        <SearchInput
          label="사전등록 이름·연락처 검색"
          placeholder="이름·연락처 (대기 일행은 대표자만)"
          value={keyword}
          onChange={(value) => setKeyword(value.slice(0, Q_MAX_LENGTH))}
        />
      </div>
      <div className="col-span-2 mobile:col-span-1">
        <RegistrationSelect
          ariaLabel="회차"
          value={filter.session}
          onChange={(session) => update({ session })}
          options={[{ value: '', label: '전체 회차' }, ...sessions]}
        />
      </div>
      <RegistrationSelect
        ariaLabel="상태"
        value={filter.status}
        onChange={(status) => update({ status })}
        options={PREREGISTER_STATUS_FILTERS}
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

export default PreregisterFilters;
