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
}

const inputStyles = cva(
  'flex rounded-sm border-1 border-solid border-gray-200 duration-200',
  {
    variants: {
      size: {
        default: 'px-6 py-5',
        small: 'h-[34px] max-w-[164px] px-2 py-1 text-black text-center',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const Input = forwardRef<HTMLInputElement, Props>(
  (
    { type, placeholder, icon, onChange, value, onIconClick, size, ...props },
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
        <label className={inputStyles({ size })}>
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
              tabIndex={0}
              aria-label="icon"
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
