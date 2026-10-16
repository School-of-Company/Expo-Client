import { format, isValid, parse } from 'date-fns';
import React, { forwardRef, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';
import HelpText from '../HelpText';

// 앞의 형식으로 보여 주고, 숫자만 친 값(0930)도 받는다
const TIME_FORMATS = ['HH:mm', 'HHmm'];

const isTypedTime = (text: string) =>
  TIME_FORMATS.some((pattern) => {
    const date = parse(text, pattern, new Date());
    return isValid(date) && format(date, pattern) === text;
  });

interface SelectTimeInputProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  /** 스크롤 컨테이너 안에서 달력이 잘리지 않도록 body 로 띄울 때 사용 */
  portalId?: string;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** 직접 친 글자를 칸을 벗어날 때 넘긴다. 목록이 열려 있으면 DatePicker 의 onBlur 가 오지 않아 입력칸에서 받는다 */
  onCommit?: (text: string) => void;
}

const CustomTimeInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, invalid, onCommit, ...props }, ref) => {
    const isEmpty = !value;
    // DatePicker 가 칸을 벗어나기 전에 글자를 이전 값으로 돌려 놓아서, 친 글자를 따로 들고 있는다
    const typed = useRef<string | null>(null);

    return (
      <input
        ref={ref}
        value={value}
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        {...props}
        onChange={(event) => {
          typed.current = event.target.value;
          props.onChange?.(event);
        }}
        onBlur={(event) => {
          if (typed.current !== null) onCommit?.(typed.current.trim());
          typed.current = null;
          props.onBlur?.(event);
        }}
        className={`flex w-full rounded-sm border-1 border-solid bg-transparent px-8 py-4 text-body2r outline-none duration-200 ${invalid ? 'border-error' : 'border-gray-200'} ${isEmpty ? 'text-center' : 'text-left'}`}
      />
    );
  },
);

CustomTimeInput.displayName = 'CustomTimeInput';

const SelectTimeInput = ({
  value,
  onChange,
  placeholder = '시간을 선택해주세요',
  portalId,
}: SelectTimeInputProps) => {
  const [hint, setHint] = useState<string | null>(null);

  // 다시 치려고 지운 순간 값이 비지 않도록, 빈칸은 칸을 벗어날 때 비운다
  const handleCommit = (text: string) => {
    if (!text) {
      if (value) onChange(null);
      return;
    }
    setHint(
      isTypedTime(text)
        ? null
        : '09:30 처럼 시:분으로 입력해주세요. 이전 값으로 되돌렸습니다.',
    );
  };

  return (
    <div className="relative w-full space-y-4">
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => {
          if (!date) return;
          setHint(null);
          onChange(date);
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={10}
        timeCaption="시간"
        dateFormat={TIME_FORMATS}
        strictParsing
        placeholderText={placeholder}
        customInput={
          <CustomTimeInput
            placeholder={placeholder}
            invalid={!!hint}
            onCommit={handleCommit}
          />
        }
        wrapperClassName="w-full"
        portalId={portalId}
      />
      {hint && <HelpText tone="error">{hint}</HelpText>}
    </div>
  );
};

export default SelectTimeInput;
