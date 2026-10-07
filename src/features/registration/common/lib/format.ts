import { RegistrationSession } from '@/shared/types/registration/type';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// YYYY-MM-DD → 10.31
export const formatShortDate = (date: string) => {
  const [, month, day] = date.split('-');
  return `${Number(month)}.${day}`;
};

// YYYY-MM-DD → 10.31(토)
export const formatDateWithWeekday = (date: string) => {
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00`).getDay()];
  return `${formatShortDate(date)}(${weekday})`;
};

export const formatSessionTime = ({
  startTime,
  endTime,
}: RegistrationSession) => `${startTime} ~ ${endTime}`;

export const formatSessionSchedule = (session: RegistrationSession) =>
  `${formatDateWithWeekday(session.date)} ${formatSessionTime(session)}`;

// ISO → 10-07 00:47:23
export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 010-1234-5678 → 010-****-5678
export const maskPhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/^(\d{3})-?\d{3,4}-?(\d{4})$/, '$1-****-$2');
