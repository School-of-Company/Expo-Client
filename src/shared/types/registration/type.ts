export type RegistrationProgramType =
  | 'GENERAL'
  | 'GOLDENBELL'
  | 'TRAINING'
  | 'KEYNOTE'
  | 'ODYSSEY';

export type RegistrationQrColor = 'BLACK' | 'GREEN' | 'BLUE' | 'PURPLE' | 'RED';

export type RegistrationProgramStatus = 'OPEN' | 'CLOSED';

export type RegistrationPromotionMode = 'AUTO' | 'MANUAL';

export type RegistrationStatus = 'CONFIRMED' | 'WAITING' | 'CANCELED';

export type RegistrationApplyType = 'GENERAL' | 'ONSITE';

export type RegistrationParticipantType =
  | 'ELEMENTARY'
  | 'MIDDLE'
  | 'HIGH'
  | 'TEACHER'
  | 'PRETEACHER'
  | 'GENERAL';

export interface RegistrationProgram {
  id: number;
  code: string;
  name: string;
  type: RegistrationProgramType;
  qrType: RegistrationProgramType;
  qrColor: RegistrationQrColor;
  maxSessionsPerPerson: number;
  status: RegistrationProgramStatus;
  /** 신청 시작/종료 일시 (YYYY-MM-DDTHH:mm). null 이면 기간 제한 없음 */
  applyStartAt: string | null;
  applyEndAt: string | null;
}

export interface RegistrationSession {
  id: number;
  programId: number;
  round: number;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  place: string;
  capacity: number;
  waitlistCapacity: number;
  promotionMode: RegistrationPromotionMode;
}

export interface RegistrationApplication {
  id: number;
  name: string;
  phoneNumber: string;
  /** 사전등록처럼 참가자 개인 연락처가 없을 때 인증에 사용한 대표 번호 */
  verifiedPhoneNumber: string;
  affiliation: string;
  region: string;
  participantType: RegistrationParticipantType;
  grade?: string;
  programId: number;
  sessionId: number;
  status: RegistrationStatus;
  applyType: RegistrationApplyType;
  createdAt: string; // ISO
}

export interface RegistrationOverview {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  applications: RegistrationApplication[];
  /** 대기자 자동 승급 종료 시각. 이후에는 수동 처리 */
  autoPromotionUntil: string | null;
}

export interface RegistrationMonitoring {
  todayPageView: number;
  todayUniqueVisitor: number;
  totalPageView: number;
  totalUniqueVisitor: number;
  todayCheckInCount: number;
}

export type RegistrationHistoryAction =
  | 'STATUS_CHANGE'
  | 'AUTO_PROMOTION'
  | 'GROUP_SMS'
  | 'SCHEDULE_SAVE'
  | 'APPLY_PERIOD'
  | 'PROMOTION_POLICY'
  | 'PROGRAM_CREATE'
  | 'SESSION_CREATE'
  | 'SESSION_DELETE';

export interface RegistrationHistory {
  id: number;
  action: RegistrationHistoryAction;
  summary: string;
  actor: string;
  createdAt: string; // ISO
}

export interface RegistrationGroupSmsRequest {
  applicationIds: number[];
  content: string;
}

export interface RegistrationGroupSmsResult {
  sentCount: number;
}

export interface RegistrationStatusChangeRequest {
  applicationIds: number[];
  status: 'CONFIRMED' | 'CANCELED';
}

export interface RegistrationStatusChangeResult {
  changedCount: number;
  skippedCount: number;
  autoPromotedCount: number;
}

export interface RegistrationScheduleSaveRequest {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
}

export interface RegistrationApplyPeriodRequest {
  applyStartAt: string | null;
  applyEndAt: string | null;
}

export interface RegistrationPromotionPolicyRequest {
  promotionMode: RegistrationPromotionMode;
  autoPromotionUntil: string | null;
}

export type RegistrationProgramCreateRequest = Pick<
  RegistrationProgram,
  'code' | 'name' | 'type' | 'maxSessionsPerPerson'
>;

export type RegistrationSessionCreateRequest = Omit<
  RegistrationSession,
  'id' | 'promotionMode'
>;
