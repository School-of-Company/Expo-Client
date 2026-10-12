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

/** Report 확정 다운로드 양식 (POST /excel/expos/{expoId}/downloads) */
export type ReportExcelTemplate =
  | 'STANDARD'
  | 'TRAINEE'
  | 'PROGRAM'
  | 'ATTENDANCE';

export type ReportExcelScope = 'SELECTED' | 'FILTER';

export type ReportApplicationStatus = 'CONFIRMED' | 'WAITING' | 'CANCELLED';

/** Application 관리자 조회와 같은 필터. page/size 는 보내지 않는다 */
export interface ReportApplicationFilter {
  programType?: 'STANDARD' | 'TRAINING';
  programId?: number;
  /** null 이면 모든 상태, 생략하면 서버 기본값 CONFIRMED */
  status: ReportApplicationStatus | null;
  sort?: 'CREATED_DESC' | 'CREATED_ASC';
}

interface ReportExcelDownloadBase {
  template: ReportExcelTemplate;
  /** PROGRAM 양식의 일반 프로그램 회차 ID */
  programId?: number;
  /** ATTENDANCE 양식의 연수자 ID */
  traineeId?: number;
}

export type ReportExcelDownloadRequest =
  | (ReportExcelDownloadBase & {
      scope: 'SELECTED';
      applicationIds: string[];
    })
  | (ReportExcelDownloadBase & {
      scope: 'FILTER';
      filter: ReportApplicationFilter;
    });
