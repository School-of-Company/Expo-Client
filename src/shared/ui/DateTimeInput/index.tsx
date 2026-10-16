import {
  dateFromString,
  dateToString,
  joinDateTime,
  splitDateTime,
  timeFromString,
  timeToString,
} from '../../lib/dateTime';
import SelectDateInput from '../SelectDateInput';
import SelectTimeInput from '../SelectTimeInput';

export const DATE_PICKER_PORTAL_ID = 'date-time-picker';

interface DateTimeInputProps {
  /** 'YYYY-MM-DDTHH:mm' */
  value: string | null;
  onChange: (value: string | null) => void;
  size?: 'default' | 'small';
  /** 'YYYY-MM-DD'. 박람회 기간처럼 날짜를 제한할 때 쓴다 */
  minDate?: string;
  maxDate?: string;
}

/** 날짜·시간 입력을 묶은 일시 입력. 값은 `<input type="datetime-local">` 과 같은 형식이다 */
const DateTimeInput = ({
  value,
  onChange,
  size = 'default',
  minDate,
  maxDate,
}: DateTimeInputProps) => {
  const { date, time } = splitDateTime(value);

  return (
    <div className="flex w-full gap-8" onClick={(e) => e.stopPropagation()}>
      <div className="flex-[3]">
        <SelectDateInput
          value={dateFromString(date)}
          onChange={(next) =>
            onChange(next ? joinDateTime(dateToString(next), time) : null)
          }
          placeholder="날짜"
          inputClassName={
            size === 'small' ? 'h-[34px] px-8 text-body2r' : 'px-16 py-12'
          }
          portalId={DATE_PICKER_PORTAL_ID}
          minDate={dateFromString(minDate ?? '') ?? undefined}
          maxDate={dateFromString(maxDate ?? '') ?? undefined}
        />
      </div>
      <div
        className={`flex-[2] ${size === 'small' ? '[&_input]:h-[34px]' : '[&_input]:px-16 [&_input]:py-12'}`}
      >
        <SelectTimeInput
          value={timeFromString(time)}
          onChange={(next) =>
            next && date && onChange(joinDateTime(date, timeToString(next)))
          }
          placeholder="시간"
          portalId={DATE_PICKER_PORTAL_ID}
        />
      </div>
    </div>
  );
};

export default DateTimeInput;
