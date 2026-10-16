import { format, isValid, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import React, { forwardRef, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';
import HelpText from '../HelpText';

// 앞의 형식으로 보여 주고, 숫자만 친 값(20261017)도 받는다
const DATE_FORMATS = ['yyyy-MM-dd', 'yyyyMMdd'];

const parseTyped = (text: string) => {
  for (const pattern of DATE_FORMATS) {
    const date = parse(text, pattern, new Date());
    if (isValid(date) && format(date, pattern) === text) return date;
  }
  return null;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isOutOfRange = (date: Date, minDate?: Date, maxDate?: Date) =>
  (!!minDate && date < startOfDay(minDate)) ||
  (!!maxDate && date > startOfDay(maxDate));

const rangeLabel = (minDate?: Date, maxDate?: Date) => {
  const min = minDate ? format(minDate, 'yyyy-MM-dd') : '';
  const max = maxDate ? format(maxDate, 'yyyy-MM-dd') : '';
  if (min && max) return `${min} ~ ${max} 사이 날짜를 입력해주세요.`;
  if (min) return `${min} 이후 날짜를 입력해주세요.`;
  return `${max} 이전 날짜를 입력해주세요.`;
};

interface SelectDateInputProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  inputClassName?: string;
  emptyCenter?: boolean;
  /** 스크롤 컨테이너 안에서 달력이 잘리지 않도록 body 로 띄울 때 사용 */
  portalId?: string;
  /** 이 범위 밖 날짜는 달력에서 고를 수 없고, 직접 입력하면 안내만 보이고 값은 바뀌지 않는다 */
  minDate?: Date;
  maxDate?: Date;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  emptyCenter?: boolean;
  invalid?: boolean;
  /** 직접 친 글자를 칸을 벗어날 때 넘긴다. 달력이 열려 있으면 DatePicker 의 onBlur 가 오지 않아 입력칸에서 받는다 */
  onCommit?: (text: string) => void;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    { value, className, emptyCenter = false, invalid, onCommit, ...props },
    ref,
  ) => {
    const isEmpty = !value;
    // DatePicker 가 칸을 벗어나기 전에 글자를 이전 값으로 돌려 놓아서, 친 글자를 따로 들고 있는다
    const typed = useRef<string | null>(null);
    const textAlignClass = emptyCenter && isEmpty ? 'text-center' : 'text-left';

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
        className={`text-body4 flex w-full rounded-sm border-1 border-solid bg-transparent outline-none duration-200 ${invalid ? 'border-error' : 'border-gray-200'} ${textAlignClass} ${className}`}
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
  minDate,
  maxDate,
}: SelectDateInputProps) => {
  const [hint, setHint] = useState<string | null>(null);

  // 타이핑 중에는 끝까지 친 값만 판단한다. 모자란 값은 칸을 벗어날 때 안내한다
  const handleRawChange = (event?: React.SyntheticEvent) => {
    if (!(event?.target instanceof HTMLInputElement)) return;
    const date = parseTyped(event.target.value.trim());
    setHint(
      date && isOutOfRange(date, minDate, maxDate)
        ? rangeLabel(minDate, maxDate)
        : null,
    );
  };

  // 다시 치려고 지운 순간 값이 비지 않도록, 빈칸은 칸을 벗어날 때 비운다
  const handleCommit = (text: string) => {
    if (!text) {
      if (value) onChange(null);
      return;
    }
    if (!parseTyped(text)) {
      const example = format(new Date(), 'yyyy-MM-dd');
      setHint(
        `${example} 처럼 연-월-일로 입력해주세요. 이전 값으로 되돌렸습니다.`,
      );
    }
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
        onChangeRaw={handleRawChange}
        dateFormat={DATE_FORMATS}
        strictParsing
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        customInput={
          <CustomInput
            placeholder={placeholder}
            className={inputClassName}
            emptyCenter={emptyCenter}
            invalid={!!hint}
            onCommit={handleCommit}
          />
        }
        wrapperClassName="w-full"
        locale={ko}
        portalId={portalId}
      />
      {hint && <HelpText tone="error">{hint}</HelpText>}
    </div>
  );
};

export default SelectDateInput;
