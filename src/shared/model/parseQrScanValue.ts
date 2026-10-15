import { QrScanData } from '../types/common/QrScanData';

// 종이 QR 토큰: JSON이 아닌 base64url 문자열. Swagger는 최대 64자만 보장해 길이를 고정하지 않는다
const PAPER_QR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Swagger 제약: code 1~22자, phoneNumber 최대 30자
const MAX_CODE_LENGTH = 22;
const MAX_PHONE_NUMBER_LENGTH = 30;

export const QR_PARSE_ERROR_MESSAGE = 'QR 코드 데이터 파싱 오류';

export type QrScanParseResult =
  | { data: QrScanData; error: null }
  | { data: null; error: string };

const fail = (error: string): QrScanParseResult => ({ data: null, error });

// 양의 정수(safe integer)만 받는다. 숫자 문자열("55")도 숫자로 바꿔 받는다
const toPositiveId = (value: unknown): number | null => {
  const id =
    typeof value === 'string' && /^[1-9]\d*$/.test(value)
      ? Number(value)
      : value;
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0
    ? id
    : null;
};

const isStringWithin = (value: unknown, max: number) =>
  typeof value === 'string' && value.length >= 1 && value.length <= max;

// JSON QR 값을 검증해 아는 필드만 남긴다. token은 종이 QR 전용이라 JSON에서는 받지 않는다
const toQrScanData = (parsed: Record<string, unknown>): QrScanParseResult => {
  const { participantId, traineeId, code, phoneNumber } = parsed;
  const data: QrScanData = {};

  if (participantId !== undefined) {
    const id = toPositiveId(participantId);
    if (id === null) return fail('참가자 ID가 올바르지 않은 QR입니다.');
    data.participantId = id;
  }
  if (traineeId !== undefined) {
    const id = toPositiveId(traineeId);
    if (id === null) return fail('연수자 ID가 올바르지 않은 QR입니다.');
    data.traineeId = id;
  }
  if (code !== undefined) {
    if (!isStringWithin(code, MAX_CODE_LENGTH)) {
      return fail('참가자 코드가 올바르지 않은 QR입니다.');
    }
    data.code = code as string;
  }
  if (phoneNumber !== undefined) {
    if (!isStringWithin(phoneNumber, MAX_PHONE_NUMBER_LENGTH)) {
      return fail('전화번호가 올바르지 않은 QR입니다.');
    }
    data.phoneNumber = phoneNumber as string;
  }

  if (Object.keys(data).length === 0) {
    return fail('참가자 정보가 없는 QR입니다.');
  }
  return { data, error: null };
};

// 스캐너가 읽은 문자열을 QR 값으로 바꾼다. 알 수 없는 형식이거나 값이 제약을 벗어나면 error
export const parseQrScanValue = (raw: string): QrScanParseResult => {
  const value = raw.trim();

  if (value.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      return fail(QR_PARSE_ERROR_MESSAGE);
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return toQrScanData(parsed as Record<string, unknown>);
    }
    return fail(QR_PARSE_ERROR_MESSAGE);
  }

  if (PAPER_QR_TOKEN_PATTERN.test(value)) {
    return { data: { token: value }, error: null };
  }

  return fail(QR_PARSE_ERROR_MESSAGE);
};
