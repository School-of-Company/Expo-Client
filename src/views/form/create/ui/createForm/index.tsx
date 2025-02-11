'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CreateFormButton } from '@/entities/form/create';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { preventEvent } from '@/shared/model/preventEvent';
import {
  CreateFormRequest,
  FormValues,
  Option,
} from '@/shared/types/form/create/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/form/create/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { selectOptionData } from '../../model/selectOptionData';
import { useCreateApplicationForm } from '../../model/useCreateApplicationForm';
import { useCreateSurveyForm } from '../../model/useCreateSurveyForm';

const CreateForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation');
  const options: Option[] = selectOptionData;
  const { control, handleSubmit, register, setValue } = useForm<FormValues>({
    defaultValues: {
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const showError = (message: string) => {
    toast.error(message);
  };

  const {
    mutate: createApplicationForm,
    isPending: isApplicationPending,
    isSuccess: isApplicationSuccess,
  } = useCreateApplicationForm(id, navigation, router);

  const {
    mutate: createSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useCreateSurveyForm(id, navigation, router);

  const onSubmit = (data: FormValues) => {
    const isSurvey =
      navigation === 'standard_survey' || navigation === 'trainee_survey';

    const participantOrType = [
      'standard_application',
      'standard_survey',
    ].includes(navigation || '')
      ? 'STANDARD'
      : 'TRAINEE';

    const formattedData = {
      ...(isSurvey
        ? { participationType: participantOrType }
        : { participantType: participantOrType }),
      ...(isSurvey
        ? {
            dynamicSurveyRequestDto: data.questions.map((question) => ({
              title: question.title,
              formType: question.formType,
              jsonData: JSON.stringify(
                question.options.reduce(
                  (acc, option, index) => {
                    acc[(index + 1).toString()] = option.value;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
              ),
              requiredStatus: question.requiredStatus,
              otherJson: question.otherJson,
            })),
          }
        : {
            dynamicForm: data.questions.map((question) => ({
              title: question.title,
              formType: question.formType,
              jsonData: JSON.stringify(
                question.options.reduce(
                  (acc, option, index) => {
                    acc[(index + 1).toString()] = option.value;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
              ),
              requiredStatus: question.requiredStatus,
              otherJson: question.otherJson,
            })),
            informationImage: '',
          }),
    };

    if (isSurvey) {
      createSurveyForm(formattedData as CreateFormRequest);
    } else {
      createApplicationForm(formattedData as CreateFormRequest);
    }
  };

  const navigationTitles: Record<string, string> = {
    standard_application: '참가자 신청 폼',
    trainee_application: '연수자 신청 폼',
    standard_survey: '참가자 만족도 조사 폼',
    trainee_survey: '연수자 만족도 조사 폼 ',
  };

  useEffect(() => {
    setValue('questions', []);
  }, [navigation, setValue]);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          preventEvent(e);
          handleSubmit(onSubmit, (errors) => {
            console.log(errors);
            handleFormErrors(errors, showError);
          })(e);
        }}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5 pb-5"
      >
        <PageHeader
          title={navigationTitles[navigation || 'standard_application']}
        />

        <div className="w-full space-y-8">
          {fields.map((field, index) => (
            <FormContainer
              key={field.id}
              options={options}
              formRemove={remove}
              index={index}
              register={register}
              setValue={setValue}
              control={control}
            />
          ))}
        </div>

        <CreateFormButton
          onClick={(e: React.MouseEvent) => {
            preventEvent(e);
            append({
              title: '',
              formType: 'SENTENCE',
              options: [],
              requiredStatus: false,
              otherJson: null,
            });
          }}
        />

        <Button
          type="submit"
          text={
            isApplicationPending || isSurveyPending
              ? '제출 중...'
              : isApplicationSuccess || isSurveySuccess
                ? '완료됨'
                : '다음'
          }
          disabled={
            isApplicationPending ||
            isSurveyPending ||
            isApplicationSuccess ||
            isSurveySuccess
          }
        />
      </form>
    </div>
  );
};

export default CreateForm;
