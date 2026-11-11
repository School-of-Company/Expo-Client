'use client';

import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { ImageInput } from '@/entities/exhibition';
import TrainingModule, {
  getProgramSectionId,
} from '@/entities/exhibition/ui/TrainingModule';
import { useAddressSearch } from '@/features/exhibition/common/hooks/useAddressSearch';
import { getPolicyProgramTypes } from '@/features/exhibition/create/lib/programPolicy';
import {
  createRegistrationDrafts,
  getRegistrationProblem,
  REGISTRATION_PARTICIPANTS,
} from '@/features/exhibition/create/lib/registrationForm';
import RegistrationFormsStep from '@/features/exhibition/create/ui/RegistrationFormsStep';
import { validateProgramForm } from '@/features/form/program';
import { FormBuilder } from '@/features/form-builder';
import { Location } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';
import { handleFormErrors, useLeaveConfirm } from '@/shared/model';
import { showError } from '@/shared/model';
import {
  ExhibitionFormData,
  MutationType,
} from '@/shared/types/exhibition/type';
import { Button, DetailHeader, Input } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import TextArea from '@/shared/ui/TextArea';

/**
 * 생성 화면은 한 화면에 다 보이면 복잡해서 단계로 나눠 보여 준다. 값은 한 폼에 모아 두고 마지막 단계에서 한 번에 저장한다.
 * 수정 화면은 지금처럼 한 화면에 다 보인다
 */
const STEPS: { title: string; fields: (keyof ExhibitionFormData)[] }[] = [
  { title: '기본 정보', fields: ['image', 'title', 'introduction'] },
  {
    title: '기간·장소',
    fields: ['startedDay', 'finishedDay', 'address', 'location'],
  },
  { title: '프로그램', fields: ['trainings', 'standard'] },
  { title: '등록 폼', fields: ['registrationForms'] },
  { title: '신청 폼', fields: ['programForms'] },
  {
    title: '사전등록 정원',
    fields: ['preregisterTeacherCapacity', 'preregisterNonTeacherCapacity'],
  },
];

const PROGRAM_FORM_LABEL = {
  STANDARD: '참가자 프로그램 신청 폼',
  TRAINING: '연수 신청 폼',
} as const;

const pickErrors = (
  errors: FieldErrors<ExhibitionFormData>,
  fields: (keyof ExhibitionFormData)[],
) =>
  Object.fromEntries(
    fields.filter((f) => errors[f]).map((f) => [f, errors[f]]),
  ) as FieldErrors<ExhibitionFormData>;

const ExhibitionForm = ({
  defaultValues = {},
  mutation,
}: {
  defaultValues?: Partial<ExhibitionFormData>;
  mutation: MutationType;
}) => {
  const [initialValues] = useState<ExhibitionFormData>(() => ({
    title: '',
    introduction: '',
    startedDay: '',
    finishedDay: '',
    image: '',
    address: '',
    location: '',
    trainings: [],
    standard: [],
    preregisterTeacherCapacity: '',
    preregisterNonTeacherCapacity: '',
    programForms: {
      STANDARD: { informationText: '', dynamicForm: [] },
      TRAINING: { informationText: '', dynamicForm: [] },
    },
    registrationForms: createRegistrationDrafts(),
    ...defaultValues,
  }));
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<ExhibitionFormData>({ defaultValues: initialValues });
  // 저장에 성공한 뒤에는 묻지 않는다
  useLeaveConfirm(isDirty && !mutation.isSuccess);
  const pathname = usePathname();
  const isEditMode = pathname.split('/').includes('edit');
  const [step, setStep] = useState(0);
  const isLastStep = isEditMode || step === STEPS.length - 1;
  // 수정 화면은 모든 단계를 한 번에 보여 준다
  const isStepVisible = (index: number) => isEditMode || step === index;
  // 긴 단계에서 '다음'을 누르면 아래쪽에 머물러 새 단계 제목이 안 보이므로 맨 위로 올린다
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const onSubmit = (data: ExhibitionFormData) => {
    mutation.mutate(data);
  };

  // 접힌 섹션 안에서 검증이 걸리면 어디가 문제인지 보이지 않으므로 펼쳐 준다
  const openProgramSections = (errors: FieldErrors<ExhibitionFormData>) =>
    (['trainings', 'standard'] as const).forEach((fieldName) => {
      if (!errors[fieldName]) return;
      const section = document.getElementById(getProgramSectionId(fieldName));
      if (section instanceof HTMLDetailsElement) section.open = true;
    });

  const onInvalid = (errors: FieldErrors<ExhibitionFormData>) => {
    // 마지막 단계에서 앞 단계 값이 비어 있으면 그 단계로 돌아가 보여 준다
    const errorStep = STEPS.findIndex(
      ({ fields }) => Object.keys(pickErrors(errors, fields)).length > 0,
    );
    if (!isEditMode && errorStep >= 0) setStep(errorStep);
    openProgramSections(errors);
    handleFormErrors(errors, showError);
  };

  // 다음 단계로 넘어가기 전에 이번 단계 칸만 확인한다. 다른 단계의 빈 칸은 그 단계에서 알려 준다
  const goNext = handleSubmit(
    () => setStep((current) => current + 1),
    (errors) => {
      const stepErrors = pickErrors(errors, STEPS[step].fields);
      if (Object.keys(stepErrors).length === 0) {
        setStep((current) => current + 1);
        return;
      }
      openProgramSections(stepErrors);
      handleFormErrors(stepErrors, showError);
    },
  );

  const policyProgramTypes = getPolicyProgramTypes({
    standard: watch('standard'),
    trainings: watch('trainings'),
  });

  const { openAddressSearch } = useAddressSearch(setValue);

  // 폼 질문 목록도 배열이라 이름을 좁혀 두지 않으면 회차 목록 타입이 넓어진다
  const trainingFields = useFieldArray<
    ExhibitionFormData,
    'trainings' | 'standard'
  >({
    control,
    name: 'trainings',
  });

  const standardFields = useFieldArray<
    ExhibitionFormData,
    'trainings' | 'standard'
  >({
    control,
    name: 'standard',
  });

  // 온라인 신청을 받는 구분의 폼만 검사한다. 수정 화면은 신청 설정을 일정 관리에서 한다
  register('registrationForms', {
    validate: (forms) =>
      isEditMode ||
      REGISTRATION_PARTICIPANTS.map((participant) =>
        getRegistrationProblem(participant, forms[participant]),
      ).find(Boolean) ||
      true,
  });
  register('programForms', {
    validate: (forms, values) => {
      if (isEditMode) return true;
      const problems = getPolicyProgramTypes(values).flatMap((programType) =>
        validateProgramForm(forms[programType].dynamicForm).map(
          (problem) => `${PROGRAM_FORM_LABEL[programType]}: ${problem}`,
        ),
      );
      return problems.length === 0 || problems.join('\n');
    },
  });
  register('startedDay', { required: '박람회 시작 일과 시간을 입력해주세요.' });
  register('finishedDay', {
    required: '박람회 종료 일과 시간을 입력해주세요.',
    // 하루짜리 박람회가 있어 같은 날은 받는다. 수정 화면 기본값에 시각이 붙어 와도 날짜로만 비교한다
    validate: (finishedDay, { startedDay }) =>
      !startedDay ||
      !finishedDay ||
      finishedDay.slice(0, 10) >= startedDay.slice(0, 10) ||
      '박람회 종료일은 시작일보다 빠를 수 없습니다.',
  });

  return (
    <form
      // 입력 칸에서 엔터를 눌러도 마지막 단계 전에는 저장하지 않고 다음 단계로 넘어간다
      onSubmit={isLastStep ? handleSubmit(onSubmit, onInvalid) : goNext}
      method="POST"
      className="flex w-full max-w-[816px] flex-1 flex-col overflow-y-auto"
    >
      <DetailHeader
        headerTitle={isEditMode ? '박람회 수정하기' : '박람회 생성하기'}
      />
      {!isEditMode && (
        <ol aria-label="박람회 생성 단계" className="mt-28 flex gap-8">
          {STEPS.map(({ title }, index) => (
            <li
              key={title}
              aria-current={index === step ? 'step' : undefined}
              className={`flex-1 border-b-2 border-solid pb-8 text-center text-body2b mobile:text-caption1b ${
                index === step
                  ? 'border-main-600 text-main-600'
                  : index < step
                    ? 'border-main-200 text-gray-500'
                    : 'border-gray-200 text-gray-400'
              }`}
            >
              {index + 1}. {title}
            </li>
          ))}
        </ol>
      )}
      <div className="mt-44 space-y-28">
        {/* 단계를 넘어가도 입력 칸이 사라지지 않게 숨기기만 한다(사진 미리보기 등이 유지된다) */}
        <div hidden={!isStepVisible(0)} className="space-y-28">
          <div className="space-y-8">
            <p className="text-h3b text-black">사진 등록</p>
            <ImageInput
              register={register('image', { required: '사진을 등록해주세요.' })}
              setValue={setValue}
              id="imageUpload"
              defaultImage={defaultValues.image}
            />
          </div>
          <div className="space-y-8">
            <p className="text-h3b text-black">제목</p>
            <Input
              {...register('title', { required: '제목을 입력해주세요.' })}
              type="text"
              placeholder="제목을 입력해주세요."
            />
          </div>
          <TextArea
            title="초대의 글"
            placeholder="초대의 글을 작성해주세요."
            maxLength={1000}
            registration={register('introduction', {
              required: '초대의 글을 입력해주세요.',
            })}
            row={1}
            value={watch('introduction')}
          />
        </div>
        <div hidden={!isStepVisible(1)} className="space-y-28">
          <div className="space-y-8">
            <p className="text-h3b text-black">박람회 기간</p>
            <div className="space-y-8">
              <div className="flex items-center gap-7">
                <SelectDateInput
                  value={
                    watch('startedDay') ? new Date(watch('startedDay')) : null
                  }
                  onChange={(date) =>
                    setValue(
                      'startedDay',
                      date ? format(date, 'yyyy-MM-dd') : '',
                      { shouldDirty: true },
                    )
                  }
                  placeholder="시작일"
                />
                <SelectDateInput
                  value={
                    watch('finishedDay') ? new Date(watch('finishedDay')) : null
                  }
                  onChange={(date) =>
                    setValue(
                      'finishedDay',
                      date ? format(date, 'yyyy-MM-dd') : '',
                      { shouldDirty: true },
                    )
                  }
                  placeholder="마감일"
                />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-h3b text-black">장소</p>
            <Input
              {...register('address', {
                required: '장소를 입력해주세요.',
              })}
              type="text"
              placeholder="장소를 입력해주세요."
              icon={<Location fill={COLORS.gray500} />}
              onClick={openAddressSearch}
              readOnly
            />
            <Input
              {...register('location', {
                required: '상세주소를 입력해주세요',
              })}
              type="text"
              placeholder="상세주소를 입력해주세요."
            />
          </div>
        </div>
        <div hidden={!isStepVisible(2)} className="space-y-28">
          <TrainingModule
            title="연수 프로그램"
            fields={trainingFields.fields}
            append={trainingFields.append}
            remove={trainingFields.remove}
            register={register}
            setValue={setValue}
            watch={watch}
            fieldName="trainings"
            withPolicy={!isEditMode}
          />
          <TrainingModule
            title="참가자 프로그램"
            fields={standardFields.fields}
            append={standardFields.append}
            remove={standardFields.remove}
            register={register}
            setValue={setValue}
            watch={watch}
            fieldName="standard"
            withPolicy={!isEditMode}
          />
        </div>
        {!isEditMode && (
          <div hidden={!isStepVisible(3)} className="space-y-28">
            <RegistrationFormsStep
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </div>
        )}
        {!isEditMode && (
          <div hidden={!isStepVisible(4)} className="space-y-28">
            {policyProgramTypes.length === 0 ? (
              <p className="break-keep text-body2r text-gray-500">
                온라인 신청을 받는 회차가 없습니다.
              </p>
            ) : (
              policyProgramTypes.map((programType) => (
                <div
                  key={programType}
                  className="space-y-24 rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[24px] mobile:px-16"
                >
                  <p className="text-h2b text-black">
                    {PROGRAM_FORM_LABEL[programType]}
                  </p>
                  <TextArea
                    title="안내 문구"
                    placeholder="신청자에게 보여 줄 안내 문구를 입력해주세요."
                    maxLength={500}
                    registration={register(
                      `programForms.${programType}.informationText`,
                    )}
                    row={1}
                    value={watch(`programForms.${programType}.informationText`)}
                  />
                  <FormBuilder
                    variant="program"
                    value={watch(`programForms.${programType}.dynamicForm`)}
                    onChange={(dynamicForm) =>
                      setValue(
                        `programForms.${programType}.dynamicForm`,
                        dynamicForm,
                        { shouldDirty: true },
                      )
                    }
                  />
                </div>
              ))
            )}
          </div>
        )}
        <div hidden={!isStepVisible(5)} className="space-y-28">
          <div className="space-y-8">
            <p className="text-h3b text-black">사전등록 회차별 정원 기본값</p>
            <p className="text-caption1r text-gray-500">
              새 사전등록 회차의 정원 초기값입니다. 이미 만든 회차의 정원은
              바뀌지 않습니다. 비워 두면 회차마다 직접 입력합니다.
            </p>
            <div className="flex items-center gap-7">
              <Input
                {...register('preregisterTeacherCapacity', {
                  setValueAs: (v) => (v === '' ? '' : Number(v)),
                })}
                type="number"
                min={0}
                placeholder="교사·예비교사 정원"
              />
              <Input
                {...register('preregisterNonTeacherCapacity', {
                  setValueAs: (v) => (v === '' ? '' : Number(v)),
                })}
                type="number"
                min={0}
                placeholder="그 외 대상 정원"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          {!isEditMode && step > 0 && (
            <Button
              type="button"
              variant="white"
              onClick={() => setStep((current) => current - 1)}
            >
              이전
            </Button>
          )}
          <Button
            disabled={mutation.isPending || mutation.isSuccess}
            type="submit"
          >
            {isEditMode ? '확인' : isLastStep ? '박람회 생성' : '다음'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ExhibitionForm;
