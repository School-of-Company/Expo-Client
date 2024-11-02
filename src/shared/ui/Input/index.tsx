'use client';

import {
  ChangeEvent,
  DetailedHTMLProps,
  InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react';

import { Eye, SelectedEye } from '@/shared/assets/icons';

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
  label?: string;
  type: string;
  placeholder: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ value, setValue, error, label, type, placeholder, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) props.onChange(e);
      setValue(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputStyle = {
      WebkitBoxShadow: '0 0 0 30px white inset !important',
      WebkitTextFillColor: 'inherit !important',
    };

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={`flex rounded-sm border-1 border-solid border-gray-200 px-6 py-5 duration-200`}
        >
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={type === 'password' && showPassword ? 'text' : type}
            className="w-full border-none bg-transparent text-body4 outline-none"
            onChange={onChange}
            style={inputStyle}
            placeholder={placeholder}
          />

          {label && <div className="break-keep">{label}</div>}

          <div className="h-5 w-5">
            {type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={`h-full w-full cursor-pointer border-none ${
                  !value.length || props.disabled ? 'hidden' : ''
                }`}
              >
                {showPassword ? <SelectedEye /> : <Eye />}
              </button>
            )}
          </div>
        </label>
        {error && <div className="mt-2 text-sm text-error">{error}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
