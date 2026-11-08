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

// 등록 유형 표기. 직업 구분이 아니다(일반 사전등록으로 신청한 교사·예비교사도 STANDARD)
export const TYPE_LABEL = {
  STANDARD: '사전등록 참가자',
  TRAINEE: '교원 연수자',
} as const;

export const TYPE_NOTICE = '표시된 구분은 등록 유형이며 직업 구분이 아닙니다.';

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
