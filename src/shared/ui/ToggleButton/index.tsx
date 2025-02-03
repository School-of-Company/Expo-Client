import React from 'react';
import { preventEvent } from '@/shared/model/preventEvent';

interface Props {
  value: boolean;
  onChange: (newValue: boolean) => void;
}

const ToggleButton = ({ value, onChange }: Props) => {
  const toggle = (e: React.MouseEvent) => {
    preventEvent(e);
    onChange(!value);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
        value ? 'bg-main-100' : 'bg-gray-100'
      }`}
    >
      <span
        className={`inline-block h-7 w-7 transform rounded-full transition-transform duration-300 ${
          value ? 'translate-x-9 bg-main-600' : 'translate-x-0 bg-gray-500'
        }`}
      />
    </button>
  );
};

export default ToggleButton;
