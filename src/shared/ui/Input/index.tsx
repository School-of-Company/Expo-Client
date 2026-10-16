'use client';
import { cva } from 'class-variance-authority';
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from 'react';

/** 입력 위에 따로 그린 제목의 id. 제목과 입력이 떨어져 있어도 입력의 접근성 이름으로 쓴다 */
export const InputLabelContext = createContext<string | undefined>(undefined);

interface Props extends Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  'size'
> {
  icon?: ReactNode;
  onIconClick?: () => void;
  /** 아이콘 버튼의 접근성 이름 */
  iconLabel?: string;
  size?: 'default' | 'small';
  error?: boolean;
}

const inputStyles = cva(
  'flex rounded-sm border-1 border-solid border-gray-200 duration-200 [h-50px]',
  {
    variants: {
      size: {
        default: 'px-16 py-12',
        small: 'h-[34px] max-w-[164px] px-2 py-1 text-black text-center',
      },
      error: {
        true: 'border-red-500',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  },
);

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      type,
      placeholder,
      icon,
      onChange,
      value,
      onIconClick,
      iconLabel = '비밀번호 표시 전환',
      size,
      error,
      ...props
    },
    ref,
  ) => {
    const contextLabelId = useContext(InputLabelContext);
    // 직접 받은 이름이 있으면 그것을 쓴다
    const labelledBy =
      props['aria-labelledby'] ??
      (props['aria-label'] ? undefined : contextLabelId);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const inputStyle = {
      WebkitBoxShadow: '0 0 0 30px white inset !important',
      WebkitTextFillColor: 'inherit !important',
    };

    return (
      <div className="w-full">
        <label className={inputStyles({ size, error })}>
          <input
            {...props}
            aria-labelledby={labelledBy}
            aria-invalid={error || props['aria-invalid']}
            ref={ref}
            type={type}
            className="text-body4 w-full border-none bg-transparent outline-none"
            style={inputStyle}
            placeholder={placeholder}
            onChange={handleChange}
            value={value}
          />
          {icon && (
            // 키보드로도 누를 수 있게 버튼으로 둔다. 보이는 아이콘은 그대로 두고 누르는 영역만 넓힌다
            <button
              type="button"
              className="-my-12 -mr-12 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center"
              onClick={onIconClick}
              aria-label={iconLabel}
            >
              <span className="h-5 w-5">{icon}</span>
            </button>
          )}
        </label>
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
