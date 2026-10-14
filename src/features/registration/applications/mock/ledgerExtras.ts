// 서버 연결 전 예시 데이터. Expo-Application-Server#107 배포 후 API 로 교체
import { AdminOccupation } from '../../common/api/ledgerApi';
import { LedgerRow } from '../../common/model/ledger';

export const LEDGER_EXTRAS_ISSUE = 'Expo-Application-Server#107';

/** 서버가 신청 행에 함께 내려 줄 예정인 값 */
export interface LedgerRowExtras {
  /** 접수번호 */
  receiptNumber: string;
  /** 학교·소속. 학생·교원만 있다 */
  school: string | null;
}

const SCHOOLS = [
  '광주중앙초등학교',
  '광주서석중학교',
  '광주소프트웨어마이스터고등학교',
  '광주교육대학교',
];

const SCHOOL_OCCUPATIONS: AdminOccupation[] = [
  'KINDERGARTEN_STUDENT',
  'ELEMENTARY_STUDENT',
  'MIDDLE_SCHOOL_STUDENT',
  'HIGH_SCHOOL_STUDENT',
  'SCHOOL_STAFF',
  'TEACHER',
  'PRE_SERVICE_TEACHER',
];

export const getLedgerRowExtras = (row: LedgerRow): LedgerRowExtras => ({
  receiptNumber: `#${row.id.slice(0, 8).toUpperCase()}`,
  school:
    row.occupation && SCHOOL_OCCUPATIONS.includes(row.occupation)
      ? SCHOOLS[row.participantId % SCHOOLS.length]
      : null,
});
