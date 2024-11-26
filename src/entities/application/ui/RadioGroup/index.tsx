'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: Option[];
  label: string;
  name: string;
  control: Control<FieldValues>;
  error?: string;
  rules?: RegisterOptions;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  label,
  name,
  control,
  error,
  rules,
}) => {
  const [otherInput, setOtherInput] = useState('');

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const otherInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [otherInput]);

  return (
    <div>
      <div className="w-full rounded-sm border-1 border-solid border-gray-200 p-[18px]">
        <div className="mb-3 text-xl">{label}</div>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <div className="flex flex-col space-y-2">
              {options.map((option) => {
                const optionId = `radio-${name}-${option.value}-${Math.random().toString(36).substr(2, 9)}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={optionId}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      id={optionId}
                      {...field}
                      value={option.value}
                      checked={field.value === option.value}
                      className="form-radio text-gray-500"
                    />
                    <span className="text-gray-800">{option.label}</span>
                    {option.value === 'other' && (
                      <input
                        ref={otherInputRef}
                        type="text"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        placeholder="(직접입력)"
                        className="ml-2 w-1/2 border border-gray-300 text-gray-800"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>
      {error && (
        <div className="float-right mt-2 flex text-sm text-error">{error}</div>
      )}
    </div>
  );
};

export default RadioGroup;
