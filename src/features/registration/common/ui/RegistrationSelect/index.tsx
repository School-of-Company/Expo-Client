import { ArrowDown } from '@/shared/assets/icons';

interface Option {
  value: string;
  label: string;
}

interface RegistrationSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  size?: 'default' | 'small';
  ariaLabel?: string;
}

/** shared Input 과 같은 테두리·여백을 쓰는 select */
const RegistrationSelect = ({
  value,
  options,
  onChange,
  size = 'default',
  ariaLabel,
}: RegistrationSelectProps) => (
  <div className="relative w-full">
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`w-full cursor-pointer appearance-none rounded-sm border-1 border-solid border-gray-200 bg-white text-black outline-none duration-200 focus:border-main-600 ${
        size === 'small'
          ? 'h-[34px] pl-8 pr-24 text-body2r'
          : 'py-12 pl-16 pr-40 text-body2r'
      }`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <span
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${size === 'small' ? 'right-4 scale-75' : 'right-12'}`}
    >
      <ArrowDown />
    </span>
  </div>
);

export default RegistrationSelect;
