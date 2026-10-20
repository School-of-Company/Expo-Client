const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 8601 → 'YYYY-MM-DDTHH:mm'(한국 시각). datetime-local 값이다. 해석할 수 없으면 빈 문자열이다 */
export const toKstLocal = (value: Date | string | null | undefined) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time)
    ? new Date(time + KST_OFFSET_MS).toISOString().slice(0, 16)
    : '';
};

/** 'YYYY-MM-DDTHH:mm'(한국 시각) → Date */
export const fromKstLocal = (local: string) =>
  local ? new Date(`${local}:00+09:00`) : null;

/** ISO 8601 → '10.31 09:00'(한국 시각). 기기 시간대와 상관없이 같게 보인다 */
export const formatKstDateTime = (value: string | null | undefined) => {
  const [date, time] = toKstLocal(value).split('T');
  if (!date) return '-';
  const [, month, day] = date.split('-');
  return `${Number(month)}.${day} ${time}`;
};
