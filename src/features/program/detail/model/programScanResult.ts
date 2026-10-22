import { ProgramScanResponse } from '@/shared/types/program/detail/type';

/** 프로그램 화면에서 마지막으로 처리한 스캔 결과. 다음 스캔 때 바뀐다 */
export interface ProgramScanResult {
  status: 'success' | 'error' | 'neutral';
  title: string;
  detail?: string;
  // 표시용 처리 시각('HH:mm:ss')
  at: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const now = () => {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const UNCHANGED_DETAIL =
  '같은 분 안에 다시 찍었거나 이미 퇴실한 QR이라 바뀐 기록이 없습니다.';

/** 스캔이 성공했을 때. 이름과 입실·퇴실 결과가 오지 않는 예전 서버는 완료로만 보여 준다 */
export const programScanSuccess = ({
  result,
  name,
  time,
}: ProgramScanResponse): ProgramScanResult => {
  const who = name || undefined;
  if (result === 'ENTERED' || result === 'LEFT') {
    const label = result === 'ENTERED' ? '입실' : '퇴실';
    return {
      status: 'success',
      title: time ? `${label} ${time}` : `${label} 완료`,
      detail: who,
      at: now(),
    };
  }
  if (result === 'UNCHANGED') {
    return {
      status: 'neutral',
      title: '변경 없음',
      detail: [who, UNCHANGED_DETAIL].filter(Boolean).join(' · '),
      at: now(),
    };
  }
  return { status: 'success', title: '스캔 완료', detail: who, at: now() };
};

/** 스캔이 거절됐을 때. 서버가 준 사유 문구를 그대로 보여 준다 */
export const programScanFailure = (
  error: unknown,
  title = '스캔 실패',
): ProgramScanResult => ({
  status: 'error',
  title,
  detail: error instanceof Error ? error.message : String(error),
  at: now(),
});
