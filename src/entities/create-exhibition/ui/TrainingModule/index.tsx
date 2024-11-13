import React from 'react';
import { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';
import ExpoInput from '../ExpoInput';

interface Props {
  fields: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['fields'];
  append: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['append'];
  remove: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['remove'];
  register: UseFormRegister<ExhibitionFormData>;
}

const TrainingModule = ({ fields, append, remove, register }: Props) => {
  return (
    <div className="w-full rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[26px]">
      <div className="w-full">
        <ExpoInput
          fields={fields}
          append={append}
          remove={remove}
          register={register}
        />
      </div>
    </div>
  );
};

export default TrainingModule;
