import { QrScanData } from '../types/common/QrScanData';

// 종이 QR 토큰: 22자 base64url
const PAPER_QR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

// 스캐너가 읽은 문자열을 QR 값으로 바꾼다. 알 수 없는 형식이면 null
export const parseQrScanValue = (raw: string): QrScanData | null => {
  const value = raw.trim();

  if (value.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as QrScanData;
      }
    } catch {
      return null;
    }
    return null;
  }

  if (PAPER_QR_TOKEN_PATTERN.test(value)) {
    return { token: value };
  }

  return null;
};
