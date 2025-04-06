import React from 'react';
import { Control, useController } from 'react-hook-form';
import { FormValues } from '@/shared/types/form/create/type';
import ToggleButton from '@/shared/ui/ToggleButton';

interface Props {
  control: Control<FormValues>;
  index: number;
}

const RequiredToggle = ({ control, index }: Props) => {
  const { field } = useController({
    name: `questions.${index}.requiredStatus`,
    control,
    defaultValue: false,
  });

  return (
    <label className="flex items-center gap-20">
      <p className="text-caption2 text-black">필수</p>
      <ToggleButton value={field.value ?? false} onChange={field.onChange} />
    </label>
  );
};

export default RequiredToggle;
