'use client';
import { cva } from 'class-variance-authority';
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
} from 'react';

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'size'
  > {
  icon?: ReactNode;
  onIconClick?: () => void;
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
      size,
      error,
      ...props
    },
    ref,
  ) => {
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
            ref={ref}
            type={type}
            className="w-full border-none bg-transparent text-body4 outline-none"
            style={inputStyle}
            placeholder={placeholder}
            onChange={handleChange}
            value={value}
          />
          {icon && (
            <div
              className="h-5 w-5 cursor-pointer"
              onClick={onIconClick}
              role="button"
              aria-label="비밀번호 표시 전환"
            >
              {icon}
            </div>
          )}
        </label>
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
