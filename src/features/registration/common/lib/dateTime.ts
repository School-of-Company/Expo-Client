const pad = (value: number) => String(value).padStart(2, '0');

// 'YYYY-MM-DD' → Date (로컬 자정)
export const dateFromString = (value: string) =>
  value ? new Date(`${value}T00:00:00`) : null;

export const dateToString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 'HH:mm' → 오늘 날짜의 해당 시각 Date (SelectTimeInput 용)
export const timeFromString = (value: string) => {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const timeToString = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 'YYYY-MM-DDTHH:mm' ↔ [날짜, 시간]
export const splitDateTime = (value: string | null) => {
  const [date = '', time = ''] = (value ?? '').split('T');
  return { date, time };
};

export const joinDateTime = (date: string, time: string) =>
  date ? `${date}T${time || '00:00'}` : null;

// 'YYYY-MM-DDTHH:mm' → '10.31 09:00'
export const formatDateTimeValue = (value: string | null) => {
  if (!value) return '제한 없음';
  const { date, time } = splitDateTime(value);
  const [, month, day] = date.split('-');
  return `${Number(month)}.${day} ${time}`;
};

// 'YYYY-MM-DDTHH:mm'(로컬) → UTC 오프셋 ISO 8601. 회차·모집 정책 일시는 이 형식만 받는다
export const toOffsetDateTime = (value: string | null) =>
  value ? new Date(value).toISOString() : null;

// UTC 오프셋 ISO 8601 → 'YYYY-MM-DDTHH:mm'(로컬)
export const fromOffsetDateTime = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return `${dateToString(date)}T${timeToString(date)}`;
};

// 'YYYY-MM-DDTHH:mm' → 'YYYY-MM-DD HH:mm'. 프로그램 생성·수정 시각 형식이다
export const toProgramDateTime = (value: string) =>
  value.slice(0, 16).replace('T', ' ');
