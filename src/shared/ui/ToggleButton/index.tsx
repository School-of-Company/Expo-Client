import { preventEvent } from '@/shared/model';

interface Props {
  value: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
}

const ToggleButton = ({ value, onChange, disabled = false }: Props) => {
  const toggle = (e: React.MouseEvent) => {
    preventEvent(e);
    if (!disabled) onChange(!value);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={toggle}
      disabled={disabled}
      className={`relative inline-flex h-24 w-44 shrink-0 items-center rounded-full p-2 transition-colors duration-200 ${
        value ? 'bg-main-600' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`h-20 w-20 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-20' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default ToggleButton;
