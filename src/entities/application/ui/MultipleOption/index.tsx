import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  name: string;
}

const MultipleOption = ({ options, name }: Props) => {
  return (
    <div>
      {options.map((option) => (
        <div key={option.value} className="mb-2 flex items-center">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            className="h-4 w-4 accent-blue-500"
          />
          <label htmlFor={`${name}-${option.value}`} className="ml-2 text-sm">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MultipleOption;
