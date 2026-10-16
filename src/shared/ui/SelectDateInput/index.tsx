import { ko } from 'date-fns/locale';
import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';

interface SelectDateInputProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  inputClassName?: string;
  emptyCenter?: boolean;
  /** 스크롤 컨테이너 안에서 달력이 잘리지 않도록 body 로 띄울 때 사용 */
  portalId?: string;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onClick?: () => void;
  className?: string;
  emptyCenter?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder, className, emptyCenter = false }, ref) => {
    const isEmpty = !value;
    const textAlignClass = emptyCenter && isEmpty ? 'text-center' : 'text-left';

    return (
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={`text-body4 flex w-full rounded-sm border-1 border-solid border-gray-200 bg-transparent outline-none duration-200 ${textAlignClass} ${className}`}
      />
    );
  },
);

CustomInput.displayName = 'CustomDateInput';

const SelectDateInput = ({
  value,
  onChange,
  placeholder = '날짜를 선택해주세요',
  inputClassName = 'px-16 py-12',
  emptyCenter = false,
  portalId,
}: SelectDateInputProps) => {
  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        customInput={
          <CustomInput
            placeholder={placeholder}
            className={inputClassName}
            emptyCenter={emptyCenter}
          />
        }
        wrapperClassName="w-full"
        locale={ko}
        portalId={portalId}
      />
    </div>
  );
};

export default SelectDateInput;
