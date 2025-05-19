import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Check } from '@/shared/assets/icons';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';

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
    <div className="flex shrink-0 items-center gap-12">
      <div
        className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-solid border-gray-200 bg-white"
        onClick={toggleCheck}
      >
        {isChecked && <Check />}
      </div>
      <p className="whitespace-nowrap text-caption1r text-gray-500">{text}</p>
    </div>
  );
};

export default CheckBox;
