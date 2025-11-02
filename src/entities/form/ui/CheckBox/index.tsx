import { Control, useController } from 'react-hook-form';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import {
  FormValues,
  ConditionalSettings,
} from '@/shared/types/form/create/type';

interface Props {
  control: Control<FormValues>;
  index: number;
  text: string;
}

const CheckBox = ({ control, index, text }: Props) => {
  const { field } = useController({
    name: `questions.${index}.otherJson`,
    control,
    defaultValue: null,
  });

  const parseOtherJson = (value: string | null): ConditionalSettings => {
    if (!value) return { hasEtc: false };
    try {
      const parsed = JSON.parse(value);
      return {
        hasEtc: parsed.hasEtc || false,
        maxSelection: parsed.maxSelection || null,
        conditional: parsed.conditional,
      };
    } catch {
      return { hasEtc: value === 'etc' };
    }
  };

  const settings = parseOtherJson(field.value);

  const toggleCheck = () => {
    const newSettings: ConditionalSettings = {
      hasEtc: !settings.hasEtc,
      maxSelection: settings.maxSelection,
      conditional: settings.conditional,
    };

    const newValue =
      !newSettings.hasEtc &&
      !newSettings.conditional &&
      newSettings.maxSelection === null
        ? null
        : JSON.stringify(newSettings);

    field.onChange(newValue);
  };

  return (
    <button
      type="button"
      onClick={toggleCheck}
      className="flex items-center gap-8"
    >
      {settings.hasEtc ? <CheckedBoxIcon /> : <CheckBoxIcon />}
      <p
        className={`text-caption1r mobile:text-caption2r ${
          settings.hasEtc ? 'text-main-600' : 'text-gray-500'
        }`}
      >
        {text}
      </p>
    </button>
  );
};

export default CheckBox;
