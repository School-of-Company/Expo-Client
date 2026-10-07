export type EntryQrQuery = {
  [key: string]: string | string[] | undefined;
};

export interface EntryQr {
  // 입구 스캐너(useQRScanner)가 읽는 입장 QR 페이로드
  value: string;
  typeLabel: string;
  // 연수자만 있음
  phoneNumber?: string;
}

const TYPE_LABEL = {
  STANDARD: '일반 참가자',
  TRAINEE: '연수자',
} as const;

const single = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value.trim() : '';

// 문자 링크
// 일반: /qr?expoId=<박람회 ID>&type=STANDARD&id=<참가자 ID>&code=<22자 코드>
// 연수자: /qr?expoId=<박람회 ID>&type=TRAINEE&id=<연수자 ID>&phoneNumber=<전화번호>
export const parseEntryQrQuery = (query: EntryQrQuery): EntryQr | null => {
  const expoId = single(query.expoId);
  const type = single(query.type).toUpperCase();
  const id = Number(single(query.id));

  if (!expoId) return null;
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  if (type === 'STANDARD') {
    const code = single(query.code);
    // 입구 스캐너가 받는 문자(영문·숫자·_·-)만 허용
    if (!/^[A-Za-z0-9_-]{22}$/.test(code)) return null;

    return {
      value: JSON.stringify({ participantId: id, code }),
      typeLabel: TYPE_LABEL.STANDARD,
    };
  }

  if (type === 'TRAINEE') {
    const phoneNumber = single(query.phoneNumber).replace(/-/g, '');
    if (!/^01\d{8,9}$/.test(phoneNumber)) return null;

    return {
      value: JSON.stringify({ traineeId: id, phoneNumber }),
      typeLabel: TYPE_LABEL.TRAINEE,
      phoneNumber,
    };
  }

  return null;
};

export const maskPhoneNumber = (phoneNumber: string) =>
  `${phoneNumber.slice(0, 3)}-****-${phoneNumber.slice(-4)}`;
