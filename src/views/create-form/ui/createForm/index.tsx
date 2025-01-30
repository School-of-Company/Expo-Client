'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CreateFormButton } from '@/entities/create-form';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { preventEvent } from '@/shared/model/preventEvent';
import { FormValues, Option } from '@/shared/types/create-form/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/create-form/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { selectOptionData } from '../../model/selectOptionData';
import { useCreateForm } from '../../model/useCreateForm';

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
    mutate: createForm,
    isPending,
    isSuccess,
  } = useCreateForm(id, navigation, router);

  const onSubmit = (data: FormValues) => {
    if (fields.length === 0) {
      toast.error('최소 한 개의 폼을 추가해주세요');
      return;
    }
    const formattedData = {
      informationImage: '',
      participantType: navigation || 'STANDARD',
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
      })),
    };
    createForm(formattedData);
  };

  const navigationTitles: Record<string, string> = {
    STANDARD: '참가자 폼',
    TRAINEE: '연수자 폼',
  };

  useEffect(() => {
    setValue('questions', []);
  }, [navigation, setValue]);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log(errors);
          handleFormErrors(errors, showError);
        })}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5 pb-5"
      >
        <PageHeader
          title={navigationTitles[navigation || 'STANDARD'] || '신청자 폼'}
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
            append({ title: '', formType: 'SENTENCE', options: [] });
          }}
        />
        <Button
          type="submit"
          text={isPending ? '제출 중...' : '다음'}
          disabled={isPending || isSuccess}
        />
      </form>
    </div>
  );
};

export default CreateForm;
