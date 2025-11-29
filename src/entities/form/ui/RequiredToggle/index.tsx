import { Control, useController } from 'react-hook-form';
import { FormValues } from '@/shared/types/form/create/type';
import ToggleButton from '@/shared/ui/ToggleButton';

interface Props {
  control: Control<FormValues>;
  index: number;
  isLocked?: boolean;
}

const RequiredToggle = ({ control, index, isLocked = false }: Props) => {
  const { field } = useController({
    name: `questions.${index}.requiredStatus`,
    control,
    defaultValue: false,
  });

  return (
    <label className="flex items-center gap-8">
      <p className="text-caption1r text-black mobile:text-caption2r">필수</p>
      <ToggleButton
        value={isLocked ? true : (field.value ?? false)}
        onChange={isLocked ? () => {} : field.onChange}
        disabled={isLocked}
      />
    </label>
  );
};

export default RequiredToggle;
