// 서버 연결 전 예시 데이터. Expo-Attendance-Server#132 배포 후 API 로 교체
import { PaperQrCategory } from '../model/constants';

export const PAPER_QR_MOCK_ISSUE = 'Expo-Attendance-Server#132';

export type PaperQrCodeStatus = 'ACTIVE' | 'USED' | 'REVOKED';

// 구분별 현재 사용 가능한 종이 QR 수
export interface PaperQrIssueStatus {
  category: PaperQrCategory;
  activeCount: number;
}

// 다시 인쇄할 때 조회하는 종이 QR 한 장. 사람이 읽는 코드와 연번이 붙는다
export interface PaperQrCode {
  code: string;
  serial: number;
  category: PaperQrCategory;
  status: PaperQrCodeStatus;
  qrValue: string;
}

export interface PaperQrMockData {
  issueStatus: PaperQrIssueStatus[];
  codes: PaperQrCode[];
}

const CODE_PREFIX: Record<PaperQrCategory, string> = {
  ADULT: 'ADT',
  CHILD: 'CHD',
  GENERAL: 'GEN',
};

const SUFFIX_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const buildCodes = (
  category: PaperQrCategory,
  total: number,
  activeCount: number,
): PaperQrCode[] =>
  Array.from({ length: total }, (_, index) => {
    const serial = index + 1;
    const suffix =
      SUFFIX_CHARS[(serial * 7) % SUFFIX_CHARS.length] +
      SUFFIX_CHARS[(serial * 13 + 5) % SUFFIX_CHARS.length];
    const code = `${CODE_PREFIX[category]}-${String(serial).padStart(4, '0')}-${suffix}`;
    return {
      code,
      serial,
      category,
      status: serial <= activeCount ? 'ACTIVE' : 'USED',
      // 실제 입장 토큰이 아닌 문자열만 담아, 찍혀 나가도 입장에 쓸 수 없다
      qrValue: `SAMPLE-NOT-VALID-${code}`,
    };
  });

const ISSUE_STATUS: PaperQrIssueStatus[] = [
  { category: 'ADULT', activeCount: 42 },
  { category: 'CHILD', activeCount: 12 },
];

const MOCK_DATA: PaperQrMockData = {
  issueStatus: ISSUE_STATUS,
  codes: [...buildCodes('ADULT', 160, 42), ...buildCodes('CHILD', 20, 12)],
};

export const getPaperQrMockData = (): PaperQrMockData => MOCK_DATA;
