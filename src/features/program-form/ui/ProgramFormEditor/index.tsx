'use client';

import { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { validateProgramForm } from '@/features/form/program';
import { ArrowDown } from '@/shared/assets/icons';
import { getErrorCode } from '@/shared/libs/http/apiError';
import { Button, Input } from '@/shared/ui';
import {
  EMPTY_PROGRAM_FORM_VALUES,
  ProgramFormValues,
  toProgramFormRequest,
} from '../../model/programFormValues';
import type { DynamicFormItem } from '@/shared/types/application/type';
import type {
  ProgramForm,
  ProgramFormRequest,
} from '@/shared/types/form/program/type';

export interface ProgramFormBuilderSlotProps {
  value: DynamicFormItem[];
  onChange: (value: DynamicFormItem[]) => void;
}

interface Props {
  defaultValues?: ProgramFormValues;
  /** 수정 중인 폼. 손대지 않은 기간을 초 단위까지 원래 값으로 보내는 데 쓴다. */
  baseForm?: ProgramForm;
  /** 실패하면 던진다. 제목 중복·기간 축소는 해당 필드 옆에 보여 준다. */
  onSubmit: (body: ProgramFormRequest) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  /**
   * 입력 필드 편집기. 예: `({ value, onChange }) => <FormBuilder variant="program" value={value} onChange={onChange} />`
   * 주입하지 않으면 기존 필드를 그대로 두는 임시 자리만 보인다.
   */
  renderBuilder?: (props: ProgramFormBuilderSlotProps) => ReactNode;
  footer?: ReactNode;
}

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-body2b text-black">{children}</p>
);

const ErrorText = ({ message }: { message?: string }) =>
  message ? (
    <p className="whitespace-pre-line text-caption1r text-error">{message}</p>
  ) : null;

/** 달력 아이콘만이 아니라 칸 어디를 눌러도 날짜 선택을 연다. 지원하지 않는 브라우저는 기본 동작 그대로다. */
const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // 사용자 동작이 아니라고 판단되면 던진다. 기본 입력은 그대로 쓸 수 있다
  }
};

const dateInputClass =
  'w-full rounded-sm border-1 border-solid border-gray-200 px-16 py-12 text-body4';

const ProgramFormEditor = ({
  defaultValues = EMPTY_PROGRAM_FORM_VALUES,
  baseForm,
  onSubmit,
  isPending,
  submitLabel,
  renderBuilder,
  footer,
}: Props) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProgramFormValues>({ defaultValues });

  const submit = handleSubmit(async (values) => {
    if (new Date(values.startDate) >= new Date(values.endDate)) {
      setError('endDate', {
        message: '종료 일시는 시작 일시보다 늦어야 합니다.',
      });
      return;
    }
    const problems = validateProgramForm(values.dynamicForm);
    if (problems.length > 0) {
      setError('root.builder', { message: problems.join('\n') });
      return;
    }

    try {
      await onSubmit(toProgramFormRequest(values, baseForm));
    } catch (error) {
      const message = (error as Error).message;
      switch (getErrorCode(error)) {
        case 'PROGRAM_FORM_TITLE_DUPLICATED':
          setError('title', { message }, { shouldFocus: true });
          break;
        case 'PROGRAM_FORM_PROTECTION_PENDING':
          setError('endDate', { message });
          break;
        default:
          toast.error(message);
      }
    }
  });

  return (
    <form onSubmit={submit} className="w-full max-w-[1000px] space-y-[30px]">
      <div className="space-y-[10px]">
        <Label>폼 제목</Label>
        <Input
          placeholder="프로그램용 폼 제목을 입력해주세요."
          error={!!errors.title}
          maxLength={100}
          {...register('title', {
            validate: (v) => !!v.trim() || '제목을 입력해주세요.',
          })}
        />
        <ErrorText message={errors.title?.message} />
      </div>

      <div className="space-y-[10px]">
        <Label>안내 문구</Label>
        <textarea
          rows={4}
          className={dateInputClass}
          placeholder="신청자에게 보여 줄 안내 문구를 입력해주세요."
          maxLength={500}
          {...register('informationText')}
        />
      </div>

      <div className="space-y-[10px]">
        <Label>대상</Label>
        <div className="relative">
          <select
            className={`${dateInputClass} cursor-pointer appearance-none bg-white pr-40`}
            {...register('participantType')}
          >
            <option value="">정하지 않음(회차에서 정함)</option>
            <option value="STANDARD">일반 참가자</option>
            <option value="TRAINEE">교원 연수자</option>
          </select>
          <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 scale-75">
            <ArrowDown />
          </span>
        </div>
      </div>

      <div className="space-y-[10px]">
        <Label>적용 기간</Label>
        <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
          <input
            type="datetime-local"
            onClick={openPicker}
            aria-label="시작 일시"
            className={`${dateInputClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            {...register('startDate', {
              required: '시작 일시를 입력해주세요.',
            })}
          />
          <input
            type="datetime-local"
            onClick={openPicker}
            aria-label="종료 일시"
            className={`${dateInputClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            {...register('endDate', { required: '종료 일시를 입력해주세요.' })}
          />
        </div>
        <ErrorText message={errors.startDate?.message} />
        <ErrorText message={errors.endDate?.message} />
      </div>

      <div className="space-y-[10px]">
        <Label>입력 필드</Label>
        <Controller
          control={control}
          name="dynamicForm"
          render={({ field: { value = [], onChange } }) =>
            renderBuilder ? (
              <>{renderBuilder({ value, onChange })}</>
            ) : (
              // ponytail: FormBuilder 머지 전 임시 자리. 머지되면 화면에서 renderBuilder 로 주입한다
              <p className="rounded-sm border-1 border-dashed border-gray-200 px-16 py-20 text-body2r text-gray-500">
                입력 필드 편집기 준비 중입니다. 현재 필드 {value.length}개는
                그대로 저장됩니다.
              </p>
            )
          }
        />
        <ErrorText message={errors.root?.builder?.message} />
      </div>

      <div className="flex gap-16">
        {footer}
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProgramFormEditor;
