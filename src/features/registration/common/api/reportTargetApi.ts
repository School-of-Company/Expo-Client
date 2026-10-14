import {
  ApiError,
  getErrorStatus,
  toApiError,
} from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ReportApplicationFilter } from '@/shared/types/registration/type';
import { AdminApplicationRow } from './ledgerApi';

// Application ReportApplicationTargetController 관리자 경로.
// 엑셀 다운로드는 Report 서버가 같은 대상을 내부 경로로 직접 조회하므로 이 함수들은 다운로드 흐름에서 호출하지 않는다
export const REPORT_TARGET_MAX_COUNT = 10000;
/** 스냅샷 페이지 상한(1–500) */
const SNAPSHOT_PAGE_LIMIT = 500;

export interface ReportTargetItem {
  expoId: string;
  application: AdminApplicationRow;
  registrationSource: { expoId: string; participantId: number };
}

interface ReportTargetSelection {
  items: ReportTargetItem[];
  totalElements: number;
}

/** 첫 페이지에만 snapshotId·만료 정보가 있다. 다음 페이지는 nextCursor 만으로 읽는다 */
interface ReportTargetSnapshotPage {
  snapshotId?: string;
  snapshotAt?: string;
  expiresAt?: string;
  totalElements: number;
  items: ReportTargetItem[];
  nextCursor?: string | null;
}

const basePath = (expoId: string) =>
  `/application/admin/expos/${encodeURIComponent(expoId)}/program-session-applications/report-targets`;

const SELECTION_NOT_FOUND =
  '선택한 신청 중 없는 신청이나 다른 행사의 신청이 섞여 있어 전체를 불러오지 못했습니다. 목록을 새로고침한 뒤 다시 선택해주세요.';

const OVER_LIMIT = `대상 신청이 최대 ${REPORT_TARGET_MAX_COUNT}건을 넘습니다. 회차·상태 필터를 좁혀 다시 시도해주세요.`;

const MESSAGES: Record<number, string> = {
  410: '다운로드 대상 목록이 만료되었습니다(15분 유지). 다시 다운로드하면 대상을 새로 만듭니다.',
  // Application 은 422, Report 다운로드는 같은 상한 초과를 413 으로 돌려준다
  413: OVER_LIMIT,
  422: OVER_LIMIT,
};

/** 410·422 는 서버 문구 대신 행동을 안내하는 고정 문구로 바꾼다 */
const toTargetError = (
  error: unknown,
  fallback: string,
  messages: Record<number, string> = MESSAGES,
) => {
  const status = getErrorStatus(error);
  return status && messages[status]
    ? new ApiError(messages[status], status)
    : toApiError(error, fallback);
};

/** 선택 신청 조회. 누락·타 행사 ID 가 하나라도 있으면 전체 404 라 부분 성공이 없다 */
export const postReportTargetSelection = async (
  expoId: string,
  applicationIds: string[],
): Promise<ReportTargetSelection> => {
  try {
    const response = await clientTokenInstance.post(
      `${basePath(expoId)}/selection`,
      { applicationIds },
    );
    return response.data;
  } catch (error) {
    throw toTargetError(error, '선택한 신청을 확인하지 못했습니다.', {
      404: SELECTION_NOT_FOUND,
    });
  }
};

/** 같은 필터 전체 대상의 스냅샷을 만들고 첫 페이지를 받는다 */
export const postReportTargetSnapshot = async (
  expoId: string,
  filter: ReportApplicationFilter,
): Promise<ReportTargetSnapshotPage> => {
  try {
    const response = await clientTokenInstance.post(basePath(expoId), {
      filter,
      limit: SNAPSHOT_PAGE_LIMIT,
    });
    return response.data;
  } catch (error) {
    throw toTargetError(error, '다운로드 대상을 만들지 못했습니다.');
  }
};

/** 필터·정렬·페이지 상한은 생성 시 고정이라 cursor 만 보낸다 */
export const getReportTargetPage = async (
  expoId: string,
  cursor: string,
): Promise<ReportTargetSnapshotPage> => {
  try {
    const response = await clientTokenInstance.get(basePath(expoId), {
      params: { cursor },
    });
    return response.data;
  } catch (error) {
    throw toTargetError(error, '다운로드 대상을 불러오지 못했습니다.');
  }
};

/** Report 다운로드가 전달한 대상 오류(404·410·413)를 같은 행동 안내 문구로 바꾼다. 선택 범위의 404 는 전체 실패다 */
export const toReportDownloadError = (
  error: unknown,
  scope: 'SELECTED' | 'FILTER',
) => {
  const status = getErrorStatus(error);
  const message =
    status === 404 && scope === 'SELECTED'
      ? SELECTION_NOT_FOUND
      : status && MESSAGES[status];
  return message ? new ApiError(message, status as number) : error;
};
