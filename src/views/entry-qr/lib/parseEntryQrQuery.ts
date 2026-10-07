export type EntryQrQuery = {
  [key: string]: string | string[] | undefined;
};

export interface EntryQr {
  // 입구 스캐너(useQRScanner)가 읽는 v1 입장 QR 페이로드
  value: string;
  typeLabel: string;
  phoneNumber: string;
}

const TYPE_LABEL = {
  STANDARD: '일반 참가자',
  TRAINEE: '연수자',
} as const;

const single = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value.trim() : '';

// 문자 링크: /qr?expoId=<박람회 ID>&type=STANDARD|TRAINEE&id=<ID>&phoneNumber=<전화번호>
export const parseEntryQrQuery = (query: EntryQrQuery): EntryQr | null => {
  const expoId = single(query.expoId);
  const type = single(query.type).toUpperCase();
  const id = Number(single(query.id));
  const phoneNumber = single(query.phoneNumber).replace(/-/g, '');

  if (!expoId) return null;
  if (type !== 'STANDARD' && type !== 'TRAINEE') return null;
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  if (!/^01\d{8,9}$/.test(phoneNumber)) return null;

  const payload =
    type === 'STANDARD'
      ? { participantId: id, phoneNumber }
      : { traineeId: id, phoneNumber };

  return {
    value: JSON.stringify(payload),
    typeLabel: TYPE_LABEL[type],
    phoneNumber,
  };
};

export const maskPhoneNumber = (phoneNumber: string) =>
  `${phoneNumber.slice(0, 3)}-****-${phoneNumber.slice(-4)}`;
