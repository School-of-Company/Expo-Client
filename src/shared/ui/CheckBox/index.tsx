import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Check } from '@/shared/assets/icons';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';

interface CheckBoxProps {
  text: string;
  name: keyof ExhibitionFormData | `${string}`;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
}

const CheckBox = ({ text, name, setValue, watch }: CheckBoxProps) => {
  const isChecked = watch(name as keyof ExhibitionFormData) === 'ESSENTIAL';

  const toggleCheck = () => {
    const newValue = isChecked ? 'CHOICE' : 'ESSENTIAL';
    setValue(name as keyof ExhibitionFormData, newValue);
  };

  return (
    <div className="flex items-center gap-5">
      <p className="text-body4 text-gray-500">{text}</p>
      <div
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-solid border-gray-200 bg-white"
        onClick={toggleCheck}
      >
        {isChecked && <Check />}
      </div>
    </div>
  );
};

export default CheckBox;
