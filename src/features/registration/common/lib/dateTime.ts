import {
  dateToString,
  splitDateTime,
  timeToString,
} from '@/shared/lib/dateTime';

// 날짜·시간 기본 변환은 shared 입력 컴포넌트와 같이 쓴다
export {
  dateFromString,
  dateToString,
  joinDateTime,
  splitDateTime,
  timeFromString,
  timeToString,
} from '@/shared/lib/dateTime';

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
