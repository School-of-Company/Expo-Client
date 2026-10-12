import { QrScanData } from '../types/common/QrScanData';

// 종이 QR 토큰: JSON이 아닌 base64url 문자열. Swagger는 최대 64자만 보장해 길이를 고정하지 않는다
const PAPER_QR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

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
