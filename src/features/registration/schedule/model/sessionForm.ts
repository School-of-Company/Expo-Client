import {
  isProgramTitleTooLong,
  PROGRAM_TITLE_MAX_LENGTH,
} from '@/shared/config/validation';
import {
  fromOffsetDateTime,
  PreregisterSession,
  PreregisterSessionDefinition,
  toOffsetDateTime,
} from '../../common';

/** 화면에서 편집하는 회차. 일시는 로컬 'YYYY-MM-DDTHH:mm' 이다 */
export interface SessionForm {
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  place: string;
  /** 입력칸을 비우면 '' 이다. 저장 전 검증에서 막는다 */
  capacity: number | '';
  waitingCapacity: number | '';
  closed: boolean;
  cancelEndedAt: string | null;
}

export const EMPTY_SESSION_FORM: SessionForm = {
  title: '',
  startedAt: null,
  endedAt: null,
  place: '',
  capacity: 1,
  waitingCapacity: 0,
  closed: false,
  cancelEndedAt: null,
};

export const toSessionForm = (session: PreregisterSession): SessionForm => ({
  title: session.title,
  startedAt: fromOffsetDateTime(session.startedAt),
  endedAt: fromOffsetDateTime(session.endedAt),
  place: session.place,
  capacity: session.capacity,
  waitingCapacity: session.waitingCapacity,
  closed: session.closed,
  cancelEndedAt: fromOffsetDateTime(session.cancelEndedAt),
});

/** 보내기 전에 서버가 400 으로 거절할 값을 막는다. 문제가 없으면 null */
export const validateSessionForm = (form: SessionForm): string | null => {
  if (!form.title.trim()) return '회차명을 입력해주세요.';
  if (isProgramTitleTooLong(form.title.trim()))
    return `회차명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
  if (!form.place.trim()) return '장소를 입력해주세요.';
  if (!form.startedAt || !form.endedAt) return '시작·종료 일시를 입력해주세요.';
  if (form.startedAt >= form.endedAt)
    return '종료 일시가 시작 일시보다 늦어야 합니다.';
  if (
    typeof form.capacity !== 'number' ||
    !Number.isInteger(form.capacity) ||
    form.capacity < 1
  )
    return '정원은 1명 이상이어야 합니다.';
  if (
    typeof form.waitingCapacity !== 'number' ||
    !Number.isInteger(form.waitingCapacity) ||
    form.waitingCapacity < 0
  )
    return '대기 정원을 확인해주세요.';
  return null;
};

export const toSessionDefinition = (
  form: SessionForm,
): PreregisterSessionDefinition => ({
  title: form.title.trim(),
  startedAt: toOffsetDateTime(form.startedAt) ?? '',
  endedAt: toOffsetDateTime(form.endedAt) ?? '',
  place: form.place.trim(),
  capacity: Number(form.capacity),
  waitingCapacity: Number(form.waitingCapacity),
  closed: form.closed,
  cancelEndedAt: toOffsetDateTime(form.cancelEndedAt),
});

export const toCount = (value: string) => Math.max(Number(value) || 0, 0);

/** 비운 칸은 0 으로 바꾸지 않고 빈 채로 둔다 */
export const toOptionalCount = (value: string) =>
  value === '' ? '' : toCount(value);
