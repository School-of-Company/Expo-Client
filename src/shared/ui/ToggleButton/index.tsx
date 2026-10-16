import { useContext } from 'react';
import { preventEvent } from '@/shared/model';
import { InputLabelContext } from '../Input';

interface Props {
  value: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
  /** 접근성 이름. 없으면 감싼 입력 제목(InputLabelContext)을 쓴다 */
  label?: string;
}

const ToggleButton = ({ value, onChange, disabled = false, label }: Props) => {
  const contextLabelId = useContext(InputLabelContext);
  const toggle = (e: React.MouseEvent) => {
    preventEvent(e);
    if (!disabled) onChange(!value);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      aria-labelledby={label ? undefined : contextLabelId}
      onClick={toggle}
      disabled={disabled}
      // 보이는 크기는 그대로 두고 위아래로 누르는 영역만 44px 까지 넓힌다
      className={`relative inline-flex h-24 w-44 shrink-0 items-center rounded-full p-2 transition-colors duration-200 before:absolute before:-inset-y-10 before:inset-x-0 before:content-[''] ${
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
