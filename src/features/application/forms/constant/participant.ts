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
