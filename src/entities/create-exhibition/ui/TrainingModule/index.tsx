import React from 'react';
import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';
import ExpoInput from '../ExpoInput';

interface Props {
  fields: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['fields'];
  append: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['append'];
  remove: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['remove'];
  register: UseFormRegister<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  fieldName: 'trainings' | 'standard';
}

const TrainingModule = ({
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
  fieldName,
}: Props) => {
  const createEmptyField = () => {
    if (fieldName === 'trainings') {
      return { title: '', startedAt: '', endedAt: '', category: 'CHOICE' };
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
