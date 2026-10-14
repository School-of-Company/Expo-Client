'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
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
import PolicyFields, { Field } from '../PolicyFields';
import { FieldLabel } from '../ScheduleSection';

interface ProgramFormProps {
  expoId: string;
  /** 없으면 새 프로그램을 만든다 */
  program?: ScheduleProgram;
  onClose: () => void;
}

const TYPE_OPTIONS = Object.entries(PROGRAM_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);

const CATEGORY_OPTIONS = [
  { value: 'ESSENTIAL', label: '필수' },
  { value: 'CHOICE', label: '선택' },
];

const ProgramForm = ({ expoId, program, onClose }: ProgramFormProps) => {
  const [form, setForm] = useState<ProgramFormValue>(() =>
    program ? toProgramForm(program) : EMPTY_PROGRAM_FORM,
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
    const error = validateProgramForm(form);
    if (error) {
      toast.error(error);
      return;
    }
    save(form);
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
          <FieldLabel>모집 정책</FieldLabel>
          <p className="text-caption1r text-gray-500">
            {canTogglePolicy
              ? '정책이 있는 프로그램만 참가자가 프로그램별로 신청할 수 있습니다.'
              : '이미 정책이 있는 프로그램은 정책을 끌 수 없습니다.'}
          </p>
        </div>
        <ToggleButton
          value={form.hasPolicy}
          disabled={!canTogglePolicy}
          onChange={(hasPolicy) => update({ hasPolicy })}
        />
      </div>
      {form.hasPolicy && (
        <PolicyFields
          value={form.policy}
          onChange={(patch) => update({ policy: { ...form.policy, ...patch } })}
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
