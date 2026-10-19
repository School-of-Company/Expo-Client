/** 마지막으로 처리한 스캔 결과. 다음 스캔 때 바뀐다 */
export interface ScanResult {
  status: 'success' | 'error';
  title: string;
  detail?: string;
  // 표시용 처리 시각('HH:mm:ss')
  at: string;
  // 재입장은 최초 입장과 눈으로 구분되게 보여 준다
  isReEntry?: boolean;
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
});

export const errorResult = (title: string, detail?: string): ScanResult => ({
  status: 'error',
  title,
  detail,
  at: now(),
});
