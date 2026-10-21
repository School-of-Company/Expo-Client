/**
 * Report 확정 다운로드 양식 (POST /excel/expos/{expoId}/downloads).
 * STANDARD·TRAINEE·PROGRAM·ATTENDANCE 는 기존 사람 명단·수기 출석부, *_LEDGER 는 신청 1건 = 1행 원장이다
 */
export type ReportExcelTemplate =
  | 'STANDARD'
  | 'TRAINEE'
  | 'PROGRAM'
  | 'ATTENDANCE'
  | 'APPLICATION_LEDGER';

export type ReportExcelScope = 'SELECTED' | 'FILTER';

export type ReportApplicationStatus = 'CONFIRMED' | 'WAITING' | 'CANCELLED';

export type ReportApplicationSort =
  | 'CREATED_DESC'
  | 'CREATED_ASC'
  | 'RECEIPT_DESC'
  | 'RECEIPT_ASC'
  | 'PROGRAM_ASC'
  | 'PROGRAM_DESC'
  | 'SESSION_ASC'
  | 'SESSION_DESC';

/** Application 관리자 조회와 같은 필터. page/size 는 보내지 않는다 */
export interface ReportApplicationFilter {
  programType?: 'STANDARD' | 'TRAINING';
  programId?: number;
  /** null 이면 모든 상태, 생략하면 서버 기본값 CONFIRMED */
  status: ReportApplicationStatus[] | null;
  /** 제출 당시 회차 제목 검색어(1–200자). 대장의 제목 검색과 같은 조건 */
  search?: string;
  /** 참가자 이름·전화번호(1–50자) */
  q?: string;
  occupation?: string;
  /** 신청 당시 회차 운영 시작일(KST, YYYY-MM-DD). 신청일이 아니다 */
  eventDate?: string;
  sort?: ReportApplicationSort;
}

interface ReportExcelDownloadBase {
  template: ReportExcelTemplate;
  /** PROGRAM 양식의 일반 프로그램 회차 ID */
  programId?: number;
  /** ATTENDANCE 양식의 연수자 ID */
  traineeId?: number;
}

export type ReportApplicationDownloadRequest =
  | (ReportExcelDownloadBase & {
      scope: 'SELECTED';
      applicationIds: string[];
    })
  | (ReportExcelDownloadBase & {
      scope: 'FILTER';
      filter: ReportApplicationFilter;
    });

export type ReportRegistrationStatus =
  | 'CONFIRMED'
  | 'WAITING'
  | 'PENDING'
  | 'CANCELLED';

/** 사전등록 접수대장 필터와 같은 의미. 페이지 없음 */
export interface ReportRegistrationFilter {
  sessionId?: number;
  status?: ReportRegistrationStatus[];
  /** 대표자·참가자 이름·번호(1–50자) */
  q?: string;
}

/** 등록 원장은 접수대장 key 로만 고른다. 프로그램 신청 ID 와 섞어 보내지 않는다 */
export type ReportRegistrationDownloadRequest =
  | { template: 'REGISTRATION_LEDGER'; scope: 'SELECTED'; keys: string[] }
  | {
      template: 'REGISTRATION_LEDGER';
      scope: 'FILTER';
      registrationFilter?: ReportRegistrationFilter;
    };

export type ReportExcelDownloadRequest =
  | ReportApplicationDownloadRequest
  | ReportRegistrationDownloadRequest;
