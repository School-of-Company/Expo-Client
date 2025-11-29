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
      onClick={toggle}
      disabled={disabled}
      className={`relative inline-flex h-16 w-50 items-center rounded-full transition-colors ${
        value ? 'bg-main-100' : 'bg-gray-100'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span
        className={`absolute left-0 h-20 w-20 rounded-full transition-transform duration-300 ${
          value ? 'translate-x-30 bg-main-600' : 'translate-x-0 bg-gray-500'
        }`}
      />
    </button>
  );
};

export default ToggleButton;
