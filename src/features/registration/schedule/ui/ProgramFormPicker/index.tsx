'use client';

import Link from 'next/link';
import { useProgramFormListQuery, useProgramFormQuery } from '@/entities/form';
import { getRegistrationRoutes } from '@/shared/config';
import { Button } from '@/shared/ui';
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
  FORM_PARTICIPANT_TYPE,
  getFormLinkProblem,
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

const formatPeriod = (start: string | null, end: string | null) =>
  `${formatDateTimeValue(start)} ~ ${formatDateTimeValue(end)}`;

/**
 * 회차에 연결할 프로그램 폼을 이 행사의 프로그램용 폼 목록에서 제목으로 고른다(Expo-Form-Server#141).
 * 목록에는 문항·행사·용도가 없어, 고른 폼은 상세를 다시 읽어 연결 가능 여부를 확인한다
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
  const listQuery = useProgramFormListQuery(expoId);
  const detailQuery = useProgramFormQuery(policy.formId);
  const selected = detailQuery.data;
  const allForms = listQuery.data ?? [];
  // 대상이 정해진 폼은 같은 대상의 회차에만 연결할 수 있다
  const forms = allForms.filter(
    ({ participantType }) =>
      !participantType ||
      participantType === FORM_PARTICIPANT_TYPE[programType],
  );
  const hiddenCount = allForms.length - forms.length;
  const isListed = forms.some(({ id }) => id === policy.formId);

  const options = [
    { value: '', label: '폼을 선택해주세요' },
    // 이미 연결된 폼이 목록에 없으면(다른 행사·등록용·대상 다름·삭제) 그대로 보여 주고 아래에서 사유를 알린다
    ...(policy.formId && !isListed
      ? [
          {
            value: policy.formId,
            label: selected
              ? `${selected.title} (이 회차에 연결할 수 없는 폼)`
              : '현재 연결된 폼',
          },
        ]
      : []),
    ...forms.map((form) => ({
      value: form.id,
      label: form.participantType
        ? `${form.title} · ${FORM_PARTICIPANT_LABEL[form.participantType]}`
        : form.title,
    })),
  ];

  const problem = selected
    ? getFormLinkProblem(selected, expoId, programType, policy)
    : detailQuery.error
      ? '연결된 폼을 불러오지 못했습니다. 삭제됐거나 프로그램용 폼이 아닐 수 있으니 다른 폼을 선택해주세요.'
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
            value={policy.formId}
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

      {listQuery.error ? (
        <p className="text-caption1r text-error">
          {listQuery.error.message}{' '}
          <button
            type="button"
            className="underline"
            onClick={() => void listQuery.refetch()}
          >
            다시 불러오기
          </button>
        </p>
      ) : (
        listQuery.isSuccess &&
        forms.length === 0 && (
          <p className="text-caption1r text-gray-500">
            이 구분에 연결할 수 있는 프로그램용 폼이 없습니다. 새 폼 만들기로
            먼저 만들어 주세요.
          </p>
        )
      )}
      {hiddenCount > 0 && (
        <p className="text-caption1r text-gray-500">
          대상이 다른 폼 {hiddenCount}개는 이 구분에 연결할 수 없어 목록에서
          뺐습니다.
        </p>
      )}
      {detailQuery.isLoading && (
        <p className="text-caption1r text-gray-500">폼을 불러오는 중입니다.</p>
      )}
      {!selected && problem && (
        <p className="text-caption1r text-error">{problem}</p>
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
    </div>
  );
};

export default ProgramFormPicker;
