import {
  RegistrationApplyType,
  RegistrationHistoryAction,
  RegistrationParticipantType,
  RegistrationProgramStatus,
  RegistrationProgramType,
  RegistrationPromotionMode,
  RegistrationQrColor,
  RegistrationStatus,
} from '@/shared/types/registration/type';

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  CONFIRMED: '확정',
  WAITING: '대기',
  CANCELED: '취소',
};

export const STATUS_TEXT_STYLE: Record<RegistrationStatus, string> = {
  CONFIRMED: 'text-main-600',
  WAITING: 'text-black',
  CANCELED: 'text-gray-300',
};

export const APPLY_TYPE_LABEL: Record<RegistrationApplyType, string> = {
  GENERAL: '일반신청',
  ONSITE: '현장신청',
};

export const PARTICIPANT_TYPE_LABEL: Record<
  RegistrationParticipantType,
  string
> = {
  ELEMENTARY: '초등학생',
  MIDDLE: '중학생',
  HIGH: '고등학생',
  TEACHER: '교직원',
  PRETEACHER: '예비교사',
  GENERAL: '일반인',
};

export const PROGRAM_TYPE_LABEL: Record<RegistrationProgramType, string> = {
  GENERAL: '일반/사전등록',
  GOLDENBELL: '골든벨',
  TRAINING: '교원연수',
  KEYNOTE: '특강',
  ODYSSEY: '오디세이',
};

export const QR_COLORS: RegistrationQrColor[] = [
  'BLACK',
  'GREEN',
  'BLUE',
  'PURPLE',
  'RED',
];

export const PROGRAM_STATUS_LABEL: Record<RegistrationProgramStatus, string> = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

export const PROMOTION_MODE_LABEL: Record<RegistrationPromotionMode, string> = {
  AUTO: 'AUTO - 자동 승급',
  MANUAL: 'MANUAL - 수동 승급',
};

export const HISTORY_ACTION_LABEL: Record<RegistrationHistoryAction, string> = {
  STATUS_CHANGE: '상태 변경',
  AUTO_PROMOTION: '자동 승급',
  GROUP_SMS: '그룹 문자',
  SCHEDULE_SAVE: '일정 저장',
  APPLY_PERIOD: '신청기간',
  PROMOTION_POLICY: '승급 정책',
  PROGRAM_CREATE: '프로그램 등록',
  SESSION_CREATE: '회차 개설',
  SESSION_DELETE: '회차 삭제',
};
