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
  /** 제출 당시 회차 제목 검색어(1–200자). 대장의 제목 검색과 같은 조건 */
  search?: string;
  sort?: 'CREATED_DESC' | 'CREATED_ASC';
}

interface ReportExcelDownloadBase {
  template: ReportExcelTemplate;
  /** PROGRAM 양식의 일반 프로그램 회차 ID */
  programId?: number;
  /** ATTENDANCE 양식의 연수자 ID */
  traineeId?: number;
}

/** 사전등록 탭 대상 필터. 프로그램 필터와 섞이지 않도록 별도 필드로 보낸다 */
export interface ReportPreregisterFilter {
  q?: string;
  sessionId?: number;
  status?: ReportApplicationStatus[];
  sort: 'CREATED_DESC' | 'CREATED_ASC';
}

export type ReportExcelDownloadRequest =
  | (ReportExcelDownloadBase & {
      scope: 'SELECTED';
      applicationIds: string[];
    })
  | (ReportExcelDownloadBase & {
      scope: 'FILTER';
      filter: ReportApplicationFilter;
    })
  // ponytail: Expo-Application-Server#123 확정 전 가정 계약. 사전등록은 예약/일행 ID 를 보낸다
  | (ReportExcelDownloadBase & {
      scope: 'SELECTED';
      source: 'PREREGISTER';
      reservationIds: string[];
    })
  | (ReportExcelDownloadBase & {
      scope: 'FILTER';
      source: 'PREREGISTER';
      preregisterFilter: ReportPreregisterFilter;
    });
