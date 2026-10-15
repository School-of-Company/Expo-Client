export type FormPeriodStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';

export const FORM_PERIOD_STATUS_LABEL: Record<FormPeriodStatus, string> = {
  UPCOMING: '접수 예정',
  OPEN: '접수중',
  CLOSED: '접수 마감',
};

export const getFormPeriodStatus = (
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): FormPeriodStatus => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return 'OPEN';
  if (now.getTime() < start) return 'UPCOMING';
  if (now.getTime() > end) return 'CLOSED';
  return 'OPEN';
};

/** "10.31(토) 09:30" */
export const formatFormPeriod = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const weekday = ['일', '월', '화', '수', '목', '금', '토'][parsed.getDay()];
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(parsed.getMonth() + 1)}.${pad(parsed.getDate())}(${weekday}) ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};
