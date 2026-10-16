'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProgramFormQuery } from '@/entities/form';
import { getRegistrationRoutes } from '@/shared/config';
import { Button, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  patchScheduleProgram,
  postScheduleProgram,
  RegistrationSelect,
  ScheduleProgram,
  useScheduleMutation,
} from '../../../common';
import { PROGRAM_TYPE_LABEL } from '../../../common/model/ledger';
import {
  EMPTY_PROGRAM_FORM,
  ProgramForm as ProgramFormValue,
  toProgramForm,
  toProgramRequest,
  validateProgramForm,
} from '../../model/policyForm';
import {
  DRAFT_QUERY,
  getFormLinkProblem,
  saveProgramDraft,
  toProgramKey,
} from '../../model/programFormLink';
import PolicyFields, { Field } from '../PolicyFields';
import { FieldLabel } from '../ScheduleSection';

interface ProgramFormProps {
  expoId: string;
  /** 없으면 새 프로그램을 만든다 */
  program?: ScheduleProgram;
  /** 묶음·공유 폼을 찾을 이 행사의 회차 */
  programs: ScheduleProgram[];
  /** 폼을 만들고 돌아왔을 때 이어서 편집할 값 */
  initialForm?: ProgramFormValue;
  onClose: () => void;
}

const TYPE_OPTIONS = Object.entries(PROGRAM_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);

const CATEGORY_OPTIONS = [
  { value: 'ESSENTIAL', label: '필수' },
  { value: 'CHOICE', label: '선택' },
];

const ProgramForm = ({
  expoId,
  program,
  programs,
  initialForm,
  onClose,
}: ProgramFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<ProgramFormValue>(
    () =>
      initialForm ?? (program ? toProgramForm(program) : EMPTY_PROGRAM_FORM),
  );
  const programKey = program ? toProgramKey(program) : undefined;
  const { data: linkedForm } = useProgramFormQuery(
    form.hasPolicy ? form.policy.formId : '',
  );
  const { mutate: save, isPending } = useScheduleMutation(
    expoId,
    (value: ProgramFormValue) =>
      program
        ? patchScheduleProgram(program, toProgramRequest(value))
        : postScheduleProgram(
            expoId,
            value.programType,
            toProgramRequest(value),
          ),
    program ? '프로그램을 수정했습니다.' : '프로그램을 등록했습니다.',
    onClose,
  );

  const update = (patch: Partial<ProgramFormValue>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    const error =
      validateProgramForm(form) ??
      (form.hasPolicy && linkedForm
        ? getFormLinkProblem(linkedForm, expoId, form.programType, form.policy)
        : null);
    if (error) {
      toast.error(error);
      return;
    }
    save(form);
  };

  // 지금 고치던 회차를 남겨 두고 폼을 만들러 간다. 폼을 저장하면 이 회차로 돌아와 새 폼이 연결된다
  const handleCreateForm = () => {
    if (!saveProgramDraft(expoId, { target: programKey ?? 'new', form })) {
      toast.error(
        '브라우저 저장소를 쓸 수 없어 회차 초안을 남기지 못했습니다. 폼 관리에서 폼을 먼저 만들어 주세요.',
      );
      return;
    }
    // 브라우저 뒤로 가기로 돌아와도 초안이 다시 열리도록 지금 주소에 이어서 편집 표시를 남긴다
    const url = new URL(window.location.href);
    url.searchParams.set(DRAFT_QUERY.resume, '1');
    window.history.replaceState(null, '', url);
    router.push(
      `${getRegistrationRoutes(expoId).programFormNew}?${DRAFT_QUERY.returnTo}=schedule`,
    );
  };

  // 서버는 policy 가 null 이면 기존 정책을 유지하므로 한 번 만든 정책은 끌 수 없다
  const canTogglePolicy = !program?.policy;

  return (
    <div className="space-y-[20px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
      <p className="text-body1b text-black">
        {program ? `${program.title} 수정` : '새 프로그램'}
      </p>
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <Field label="구분">
          {program ? (
            <p className="flex h-[48px] items-center text-body2r text-black">
              {PROGRAM_TYPE_LABEL[form.programType]}
            </p>
          ) : (
            <RegistrationSelect
              value={form.programType}
              options={TYPE_OPTIONS}
              onChange={(value) =>
                update({
                  programType: value as ProgramFormValue['programType'],
                })
              }
            />
          )}
        </Field>
        <Field label="프로그램명">
          <Input
            placeholder="프로그램명을 입력해주세요."
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </Field>
        {form.programType === 'TRAINING' && (
          <Field label="연수 구분">
            <RegistrationSelect
              value={form.category}
              options={CATEGORY_OPTIONS}
              onChange={(value) =>
                update({ category: value as ProgramFormValue['category'] })
              }
            />
          </Field>
        )}
        <Field label="장소 (선택)">
          <Input
            placeholder="비우면 '장소 추후 안내'로 표시됩니다."
            value={form.place}
            onChange={(e) => update({ place: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        <Field label="시작">
          <DateTimeInput
            value={form.startedAt}
            onChange={(startedAt) => update({ startedAt })}
          />
        </Field>
        <Field label="종료">
          <DateTimeInput
            value={form.endedAt}
            onChange={(endedAt) => update({ endedAt })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between gap-16">
        <div className="space-y-6">
          <FieldLabel>온라인 신청 받기 (신청 폼·모집 정책)</FieldLabel>
          <p className="text-caption1r text-gray-500">
            {canTogglePolicy
              ? '켜면 프로그램 폼을 연결하고 정원·모집 기간을 정해 참가자가 이 프로그램을 신청할 수 있습니다.'
              : '이미 신청을 받는 프로그램은 끌 수 없습니다.'}
          </p>
          {!form.hasPolicy && (
            <p className="text-caption1r text-error">
              끄면 신청 폼 없이 저장되어 참가자가 온라인으로 신청할 수 없습니다.
            </p>
          )}
        </div>
        <ToggleButton
          value={form.hasPolicy}
          disabled={!canTogglePolicy}
          onChange={(hasPolicy) => update({ hasPolicy })}
        />
      </div>
      {form.hasPolicy && (
        <PolicyFields
          expoId={expoId}
          programType={form.programType}
          programs={programs}
          programKey={programKey}
          value={form.policy}
          onChange={(patch) =>
            setForm((prev) => ({
              ...prev,
              policy: { ...prev.policy, ...patch },
            }))
          }
          onCreateForm={handleCreateForm}
        />
      )}
      <div className="grid grid-cols-2 gap-16">
        <Button variant="gray" onClick={onClose}>
          취소
        </Button>
        <Button disabled={isPending} onClick={handleSubmit}>
          {isPending ? '저장 중...' : program ? '수정 저장' : '프로그램 등록'}
        </Button>
      </div>
    </div>
  );
};

export default ProgramForm;
