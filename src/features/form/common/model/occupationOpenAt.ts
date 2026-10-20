/**
 * 일반 사전등록의 유형별 오픈 시각(`occupationOpenAt`, Form #164) 편집 값.
 * 운영자는 한국 시각으로 입력한다. 브라우저 시간대와 상관없이 +09:00 으로 보낸다.
 */
export interface OccupationOpenAtValue {
  /** 끄면 별도 제한 없이 공통 신청 기간을 쓴다(서버에는 `null`). */
  enabled: boolean;
  /** 'YYYY-MM-DDTHH:mm'(한국 시각). datetime-local 값 그대로다. */
  local: string;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const toTime = (value: string | null | undefined) =>
  value ? new Date(value).getTime() : NaN;

/** ISO 8601 → 'YYYY-MM-DDTHH:mm'(한국 시각). 해석할 수 없으면 빈 문자열이다. */
export const toKstInput = (iso: string | null | undefined) => {
  const time = toTime(iso);
  return Number.isFinite(time)
    ? new Date(time + KST_OFFSET_MS).toISOString().slice(0, 16)
    : '';
};

/** 'YYYY-MM-DDTHH:mm'(한국 시각) → '2026.10.26 08:30' */
export const formatKst = (iso: string | null | undefined) =>
  toKstInput(iso).replace(/-/g, '.').replace('T', ' ');

/** 저장된 값으로 편집 값을 만든다. null 이거나 구형 응답(없음)이면 끈 상태다. */
export const toOccupationOpenAtValue = (
  iso: string | null | undefined,
): OccupationOpenAtValue => {
  const local = toKstInput(iso);
  return { enabled: !!local, local };
};

/** 공통 신청 기간과 맞지 않으면 원인을 돌려준다. 서버는 `startDate < occupationOpenAt < endDate` 를 검증한다. */
export const getOccupationOpenAtError = (
  value: OccupationOpenAtValue,
  startDate: string,
  endDate: string,
): string | null => {
  if (!value.enabled) return null;
  if (!value.local) return '그 외 유형의 신청 시작 시각을 입력해주세요.';
  const openAt = toTime(`${value.local}:00+09:00`);
  const start = toTime(startDate);
  const end = toTime(endDate);
  if (Number.isFinite(start) && openAt <= start)
    return `그 외 유형의 신청 시작은 교원·예비교사 신청 시작(${formatKst(startDate)})보다 늦어야 합니다.`;
  if (Number.isFinite(end) && openAt >= end)
    return `그 외 유형의 신청 시작은 신청 마감(${formatKst(endDate)})보다 일러야 합니다.`;
  return null;
};

/** 요청 값. 끄면 명시적 null 로 해제한다. 손대지 않은 시각은 초 단위까지 원래 값을 보낸다. */
export const toOccupationOpenAtRequest = (
  value: OccupationOpenAtValue,
  original?: string | null,
): string | null => {
  if (!value.enabled || !value.local) return null;
  if (original && toKstInput(original) === value.local) return original;
  return `${value.local}:00+09:00`;
};
