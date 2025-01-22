'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { CreateFormButton } from '@/entities/create-form';
import { preventEvent } from '@/shared/model/preventEvent';
import { FormValues, Option } from '@/shared/types/create-form/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/create-form/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { formCreateRouter } from '../../model/formCreateRouter';
import { selectOptionData } from '../../model/selectOptionData';

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

  const onSubmit = (data: FormValues) => {
    const formattedData = data.questions.map((question) => ({
      title: question.title,
      formType: question.formType,
      jsonData: question.options.reduce(
        (acc, option, index) => {
          acc[(index + 1).toString()] = option.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    }));

    console.log(formattedData);
    formCreateRouter({ id, navigation, router });
  };

  const navigationTitles: Record<string, string> = {
    standard: '참가자 폼',
    training: '연수자 폼',
    survey: '만족도 조사 폼',
  };

  useEffect(() => {
    setValue('questions', []);
  }, [navigation, setValue]);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5"
      >
        <PageHeader
          title={navigationTitles[navigation || 'standard'] || '신청자 폼'}
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
        <Button type="submit" text="다음" />
      </form>
    </div>
  );
};

export default CreateForm;
