'use client';
import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  error?: string;
  label?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      error,
      label,
      type = 'text',
      placeholder,
      onChange,
      value,
      required,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputStyle = {
      WebkitBoxShadow: '0 0 0 30px white inset !important',
      WebkitTextFillColor: 'inherit !important',
    };

    return (
      <div>
        <div className="w-full rounded-sm border-1 border-solid border-gray-200 p-[18px]">
          {label && <div className="mb-3 text-xl">{label}</div>}
          <div className="w-full">
            <label htmlFor={inputId} className="flex duration-200">
              <input
                {...props}
                id={inputId}
                ref={ref}
                type={type}
                className="w-full border-b-1 border-solid border-gray-200 py-2 text-body4 outline-none"
                style={inputStyle}
                placeholder={`${placeholder}${required ? ' *' : ''}`}
                onChange={handleChange}
                value={value}
              />
            </label>
          </div>
        </div>
        {error && (
          <div className="float-right mt-2 flex text-sm text-error">
            {error}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
