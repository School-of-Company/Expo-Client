'use client';

import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { DateButton } from '@/entities/expo-manage';

const DateContainer = ({
  startedDay,
  finishedDay,
  onDateSelect,
  selectedDate,
}: {
  startedDay: string;
  finishedDay: string;
  onDateSelect: (date: string) => void;
  selectedDate: string;
}) => {
  const dates = eachDayOfInterval({
    start: parseISO(startedDay),
    end: parseISO(finishedDay),
  });

  return (
    <div className="flex items-center gap-10">
      {dates.map((date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        return (
          <DateButton
            key={formattedDate}
            date={formattedDate}
            selected={formattedDate === selectedDate}
            onClick={() => onDateSelect(formattedDate)}
          />
        );
      })}
    </div>
  );
};

export default DateContainer;
