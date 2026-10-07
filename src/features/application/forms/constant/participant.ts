export type ParticipantType =
  | 'KINDERGARTEN'
  | 'ELEMENTARY'
  | 'SECONDARY'
  | 'GENERAL'
  | 'TEACHER'
  | 'PRE_TEACHER';

export const PARTICIPANT_TYPE_LABEL: Record<ParticipantType, string> = {
  KINDERGARTEN: '유아',
  ELEMENTARY: '초등학생',
  SECONDARY: '중고등학생',
  GENERAL: '일반',
  TEACHER: '교사',
  PRE_TEACHER: '예비교사',
};

// 교사·예비교사는 소속을 받아 QR·명찰에 "00초 홍길동" 으로 표시한다
export const NEEDS_AFFILIATION: ParticipantType[] = ['TEACHER', 'PRE_TEACHER'];

// 한 번 인증한 번호로 관리할 수 있는 최대 참가자 수 (본인 포함)
export const MAX_PARTICIPANTS = 5;

// TODO(api): 지역 목록 확정되면 교체
export const REGIONS = ['광주', '전남', '전북', '기타'];
