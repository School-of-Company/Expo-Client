import SelectDateInput from '@/shared/ui/SelectDateInput';
import SelectTimeInput from '@/shared/ui/SelectTimeInput';
import {
  dateFromString,
  dateToString,
  joinDateTime,
  splitDateTime,
  timeFromString,
  timeToString,
} from '../../lib/dateTime';

export const DATE_PICKER_PORTAL_ID = 'registration-date-picker';

interface DateTimeInputProps {
  /** 'YYYY-MM-DDTHH:mm' */
  value: string | null;
  onChange: (value: string | null) => void;
  size?: 'default' | 'small';
}

/** shared 날짜·시간 입력을 묶은 일시 입력 */
const DateTimeInput = ({
  value,
  onChange,
  size = 'default',
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
