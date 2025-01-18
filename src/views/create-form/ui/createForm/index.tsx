'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { CreateFormButton } from '@/entities/create-form';
import { FormValues, Option } from '@/shared/types/create-form/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/create-form/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { selectOptionData } from '../../model/selectOptionData';

const CreateForm = () => {
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
      jsonData: JSON.stringify(
        question.options.reduce(
          (acc, option, index) => {
            acc[(index + 1).toString()] = option.value;
            return acc;
          },
          {} as Record<string, string>,
        ),
      ),
    }));

    console.log(formattedData);
    // 서버에 전송하는 코드 추가 가능
  };

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5"
      >
        <PageHeader title="신청자 폼" />
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
          onClick={() =>
            append({ title: '', formType: 'SENTENCE', options: [] })
          }
        />
        <Button type="submit" text="다음" />
      </form>
    </div>
  );
};

export default CreateForm;
