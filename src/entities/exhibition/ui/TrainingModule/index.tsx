import React from 'react';
import { FieldArrayProps } from '@/shared/types/exhibition/type';
import ExpoInput from '../ExpoInput';

const TrainingModule = ({
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
  fieldName,
}: FieldArrayProps) => {
  const createEmptyField = () => {
    if (fieldName === 'trainings') {
      return {
        title: '',
        startedAt: '',
        endedAt: '',
        category: 'CHOICE',
      };
    }
    return { title: '', startedAt: '', endedAt: '' };
  };

  return (
    <div className="w-full rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[26px]">
      <div className="w-full">
        <ExpoInput
          fields={fields}
          append={() => append(createEmptyField())}
          remove={remove}
          register={register}
          setValue={setValue}
          watch={watch}
          fieldName={fieldName}
        />
      </div>
    </div>
  );
};

export default TrainingModule;
