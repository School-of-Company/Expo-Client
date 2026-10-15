'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProgramFormsQuery } from '@/entities/form';
import { getRegistrationRoutes } from '@/shared/config';
import { Button, Input } from '@/shared/ui';
import {
  fromOffsetDateTime,
  formatDateTimeValue,
  RegistrationSelect,
  ScheduleProgram,
} from '../../../common';
import { ProgramSessionType } from '../../../common/api/ledgerApi';
import { PolicyForm } from '../../model/policyForm';
import {
  FORM_PARTICIPANT_LABEL,
  getFormLinkProblem,
  getLinkedFormIds,
  getProgramsUsingForm,
  toProgramKey,
} from '../../model/programFormLink';

interface ProgramFormPickerProps {
  expoId: string;
  programType: ProgramSessionType;
  programs: ScheduleProgram[];
  /** 고치는 회차. 공유 회차 안내에서 뺀다 */
  programKey?: string;
  policy: PolicyForm;
  onChange: (formId: string) => void;
  /** 회차 초안을 남기고 폼 생성 화면으로 간다 */
  onCreateForm: () => void;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatPeriod = (start: string | null, end: string | null) =>
  `${formatDateTimeValue(start)} ~ ${formatDateTimeValue(end)}`;

/**
 * 회차에 연결할 프로그램 폼을 제목으로 고른다.
 * 행사별 폼 목록 API(Expo-Form-Server#141)가 없어 이 행사 회차가 쓰는 폼과 ID 로 불러온 폼만 보인다
 */
const ProgramFormPicker = ({
  expoId,
  programType,
  programs,
  programKey,
  policy,
  onChange,
  onCreateForm,
}: ProgramFormPickerProps) => {
  const [loadedIds, setLoadedIds] = useState<string[]>([]);
  const [idInput, setIdInput] = useState('');
  const formIds = Array.from(
    new Set([
      ...getLinkedFormIds(programs),
      ...loadedIds,
      ...(policy.formId ? [policy.formId] : []),
    ]),
  );
  const results = useProgramFormsQuery(formIds);
  const forms = results.flatMap(({ data }) => (data ? [data] : []));
  const selected = forms.find(({ id }) => id === policy.formId);
  const isSelectedLoading =
    Boolean(policy.formId) &&
    results[formIds.indexOf(policy.formId)]?.isLoading;

  const options = [
    { value: '', label: '폼을 선택해주세요' },
    ...forms.map((form) => ({
      value: form.id,
      label: form.participantType
        ? `${form.title} · ${FORM_PARTICIPANT_LABEL[form.participantType]}`
        : form.title,
    })),
  ];

  const handleLoadById = () => {
    const id = idInput.trim().toLowerCase();
    if (!UUID_PATTERN.test(id)) return;
    setLoadedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    onChange(id);
    setIdInput('');
  };

  const problem = selected
    ? getFormLinkProblem(selected, expoId, programType, policy)
    : null;
  const sharedPrograms = selected
    ? getProgramsUsingForm(programs, selected.id).filter(
        (program) => toProgramKey(program) !== programKey,
      )
    : [];

  return (
    <div className="space-y-12">
      <div className="flex gap-8 mobile:flex-col">
        <div className="min-w-0 flex-1">
          <RegistrationSelect
            ariaLabel="프로그램 폼"
            value={selected ? policy.formId : ''}
            options={options}
            onChange={onChange}
          />
        </div>
        <div className="w-[160px] shrink-0 mobile:w-full">
          <Button variant="white" onClick={onCreateForm}>
            새 폼 만들기
          </Button>
        </div>
      </div>

      {isSelectedLoading && (
        <p className="text-caption1r text-gray-500">폼을 불러오는 중입니다.</p>
      )}

      {selected && (
        <div className="space-y-8 rounded-sm border-1 border-solid border-gray-200 px-16 py-12">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <p className="text-body2b text-black">{selected.title}</p>
            <Link
              href={getRegistrationRoutes(expoId).programForm(selected.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption1r text-main-600 underline"
            >
              폼 편집 (새 탭)
            </Link>
          </div>
          <p className="text-caption1r text-gray-500">
            {selected.expoId.toLowerCase() === expoId.toLowerCase()
              ? '이 행사'
              : '다른 행사'}{' '}
            · {selected.purpose === 'PROGRAM' ? '프로그램용' : '등록용'} · 대상{' '}
            {selected.participantType
              ? FORM_PARTICIPANT_LABEL[selected.participantType]
              : '정하지 않음(회차에서 정함)'}{' '}
            · 질문 {selected.dynamicForm.length}개
          </p>
          <p className="text-caption1r text-gray-500">
            폼 응답 기간{' '}
            {formatPeriod(
              fromOffsetDateTime(selected.startDate),
              fromOffsetDateTime(selected.endDate),
            )}
            <br />
            회차 모집 기간{' '}
            {formatPeriod(
              policy.applicationStartedAt,
              policy.applicationEndedAt,
            )}
          </p>
          {problem && <p className="text-caption1r text-error">{problem}</p>}
          {sharedPrograms.length > 0 && (
            <p className="text-caption1r text-gray-500">
              이 폼을 함께 쓰는 회차 {sharedPrograms.length}개:{' '}
              {sharedPrograms.map(({ title }) => title).join(', ')}. 폼의
              질문·응답 기간을 고치면 이 회차들에도 똑같이 적용됩니다. 질문이나
              대상이 다르면 새 폼을 만들어 주세요.
            </p>
          )}
          <p className="text-caption1r text-gray-500">
            회차 모집 기간을 바꿔도 폼 응답 기간은 자동으로 바뀌지 않습니다.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <p className="text-caption1r text-gray-500">
          아직 회차에 연결하지 않은 폼은 목록에 보이지 않습니다. 폼 편집 화면
          주소의 ID 로 불러올 수 있습니다.
        </p>
        <div className="flex gap-8">
          <Input
            size="small"
            aria-label="폼 ID로 불러오기"
            placeholder="폼 ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 rounded-sm border-1 border-solid border-gray-200 px-16 text-caption1b text-gray-500 duration-200 hover:border-main-600 hover:text-main-600 disabled:opacity-40"
            disabled={!UUID_PATTERN.test(idInput.trim())}
            onClick={handleLoadById}
          >
            불러오기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramFormPicker;
