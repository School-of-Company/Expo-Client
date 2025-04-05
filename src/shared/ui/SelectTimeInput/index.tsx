import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';

interface SelectTimeInputProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onClick?: () => void;
}

const CustomTimeInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => {
    const isEmpty = !value;

    return (
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={`flex w-full rounded-sm border-1 border-solid border-gray-200 bg-transparent px-8 py-4 text-body2r outline-none duration-200 ${isEmpty ? 'text-center' : 'text-left'}`}
      />
    );
  },
);

CustomTimeInput.displayName = 'CustomTimeInput';

const SelectTimeInput = ({
  value,
  onChange,
  placeholder = '시간을 선택해주세요',
}: SelectTimeInputProps) => {
  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="시간"
        dateFormat="HH:mm"
        placeholderText={placeholder}
        customInput={<CustomTimeInput placeholder={placeholder} />}
        wrapperClassName="w-full"
      />
    </div>
  );
};

export default SelectTimeInput;
