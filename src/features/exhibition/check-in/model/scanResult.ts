/** 마지막으로 처리한 스캔 결과. 다음 스캔 때 바뀐다 */
export interface ScanResult {
  status: 'success' | 'error';
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

export const successResult = (title: string, detail?: string): ScanResult => ({
  status: 'success',
  title,
  detail,
  at: now(),
});

export const errorResult = (title: string, detail?: string): ScanResult => ({
  status: 'error',
  title,
  detail,
  at: now(),
});
