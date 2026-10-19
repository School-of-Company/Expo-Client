import { getErrorStatus } from '@/shared/libs/http/apiError';
import type { ScanMode } from '../ui/ScanModeToggle';

/** 마지막으로 처리한 스캔 결과. 다음 스캔 때 바뀐다 */
export interface ScanResult {
  status: 'success' | 'error';
  title: string;
  detail?: string;
  // 표시용 처리 시각('HH:mm:ss')
  at: string;
  // 재입장은 최초 입장과 눈으로 구분되게 보여 준다
  isReEntry?: boolean;
  // 직원이 다음에 할 일을 알려 주는 안내
  hint?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const now = () => {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 서버는 'HH:mm' 이나 시간대 없는 지역 일시를 줄 수 있어 시각만 남긴다
const toHourMinute = (value: string) =>
  value.includes('T') ? value.slice(11, 16) : value.slice(0, 5);

export const successResult = (title: string, detail?: string): ScanResult => ({
  status: 'success',
  title,
  detail,
  at: now(),
});

/** 퇴장한 뒤 다시 입장. 최초 입장 시각이 오면 함께 보여 준다 */
export const reEntryResult = (
  detail?: string,
  firstEnteredTime?: string,
): ScanResult => ({
  status: 'success',
  title: '재입장',
  detail: [
    detail,
    firstEnteredTime && `최초 입장 ${toHourMinute(firstEnteredTime)}`,
  ]
    .filter(Boolean)
    .join(' · '),
  at: now(),
  isReEntry: true,
  // 재입장 응답에는 명찰이 없어 오류로 오해하지 않게 알린다
  hint: '명찰은 처음 입장할 때만 출력됩니다.',
});

export const errorResult = (
  title: string,
  detail?: string,
  hint?: string,
): ScanResult => ({
  status: 'error',
  title,
  detail,
  at: now(),
  hint,
});

// 오류 본문에는 상태와 문구뿐이고 같은 400에 다른 사유(진행 기간 아님·취소된 신청 등)도 와서,
// 상태와 모드에 문구의 핵심 낱말을 더해 고른다. 문구가 조금 바뀌어도 맞도록 느슨하게 본다
const ALREADY_ENTERED = /이미.*입장/;
const NO_ENTRY_TODAY = /입장 기록이 없/;

const ENTRY_AGAIN_HINT =
  '오늘 이미 입장 처리된 QR입니다. 나갔다가 다시 들어오는 경우 먼저 퇴장 모드에서 퇴장 처리한 뒤 다시 스캔해 주세요.';
const NO_ENTRY_HINT =
  '아직 입장 처리되지 않았거나, 퇴장 기록을 시작하기 전에 입장한 QR입니다.';

const failureHint = (mode: ScanMode, status?: number, message = '') => {
  if (status !== 400) return undefined;
  if (mode === 'entry' && ALREADY_ENTERED.test(message))
    return ENTRY_AGAIN_HINT;
  if (mode === 'exit' && NO_ENTRY_TODAY.test(message)) return NO_ENTRY_HINT;
  return undefined;
};

/** 입장·퇴장 요청이 실패했을 때. 현장에서 자주 헷갈리는 오류에는 할 일을 덧붙인다 */
export const scanFailureResult = (
  mode: ScanMode,
  error: unknown,
): ScanResult => {
  const message = error instanceof Error ? error.message : undefined;
  return errorResult(
    `${mode === 'entry' ? '입장' : '퇴장'} 실패`,
    message,
    failureHint(mode, getErrorStatus(error), message),
  );
};
