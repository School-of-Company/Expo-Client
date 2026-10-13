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
