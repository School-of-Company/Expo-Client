import axios from 'axios';
import { toServerMessage } from '@/shared/libs/handler/serverMessage';
import { ApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { NETWORK_ERROR_MESSAGE } from '@/shared/libs/http/getScanErrorMessage';

// Expo-User-Server BadgePrintController(/admin/badge-prints/{expoId}). 모두 관리자 전용이다(#924)

export interface BadgePrintStation {
  stationId: string;
  label: string;
  paused: boolean;
  // 마지막 요청 시각(한국 시간). 한 번도 연 적 없으면 null
  lastSeenAt: string | null;
}

export interface CreatedBadgePrintStation {
  stationId: string;
  label: string;
  sessionId: string;
}

/** claim 으로 받은 작업. claimToken 은 결과 보고에 그대로 돌려준다 */
export interface BadgePrintClaim {
  jobId: number;
  claimToken: string;
  name: string;
  school: string | null;
}

export type BadgePrintJobStatus =
  | 'WAITING'
  | 'CLAIMED'
  | 'SUBMITTED'
  | 'FAILED'
  | 'NEEDS_CHECK'
  | 'DONE'
  | 'REQUEUED';

export interface BadgePrintJob {
  jobId: number;
  name: string;
  school: string | null;
  status: BadgePrintJobStatus;
  updatedAt: string;
}

// SUBMITTED: 인쇄를 요청함(종이가 나왔다는 뜻은 아님), FAILED_BEFORE_PRINT: 인쇄 요청 전에 확실히 실패함
export type BadgePrintOutcome = 'SUBMITTED' | 'FAILED_BEFORE_PRINT';

// 작업을 점유한 출력대. 아직 점유 전이거나 재시도로 이전 안내가 무효면 null(Expo-User-Server#241)
export interface BadgePrintJobStatusResponse {
  jobId: number;
  // 재출력을 따라간 가장 최신 작업. status·station 은 이 작업 기준이다
  currentJobId: number;
  status: BadgePrintJobStatus;
  station: { stationId: string; label: string } | null;
}

export type BadgePrintResolveAction = 'REQUEUE' | 'DONE';

const basePath = (expoId: string) =>
  `/admin/badge-prints/${encodeURIComponent(expoId)}`;

const stationPath = (expoId: string, stationId: string) =>
  `${basePath(expoId)}/stations/${encodeURIComponent(stationId)}`;

// 상태를 남겨 화면이 409(다른 곳에서 엶)·404(없는 출력대)를 구분하게 한다
const toError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return error;
  if (!error.response) return new Error(NETWORK_ERROR_MESSAGE);
  const { status, data } = error.response;
  if (status === 403) return new ApiError('관리자만 사용할 수 있습니다.', 403);
  return new ApiError(toServerMessage(status, data) ?? fallback, status);
};

export const getBadgePrintStations = async (
  expoId: string,
): Promise<BadgePrintStation[]> => {
  try {
    const response = await clientTokenInstance.get<{
      stations: BadgePrintStation[];
    }>(`${basePath(expoId)}/stations`);
    return response.data.stations;
  } catch (error) {
    throw toError(error, '출력대 목록을 불러오지 못했습니다.');
  }
};

export const createBadgePrintStation = async (
  expoId: string,
  label?: string,
): Promise<CreatedBadgePrintStation> => {
  try {
    const response = await clientTokenInstance.post<CreatedBadgePrintStation>(
      `${basePath(expoId)}/stations`,
      label ? { label } : {},
    );
    return response.data;
  } catch (error) {
    throw toError(error, '출력대를 등록하지 못했습니다.');
  }
};

/** 출력 화면을 열 때마다 새 세션을 받는다. 이전 세션(다른 탭·노트북)은 이후 409가 된다 */
export const openBadgePrintSession = async (
  expoId: string,
  stationId: string,
): Promise<string> => {
  try {
    const response = await clientTokenInstance.post<{ sessionId: string }>(
      `${stationPath(expoId, stationId)}/sessions`,
    );
    return response.data.sessionId;
  } catch (error) {
    throw toError(error, '출력대를 열지 못했습니다.');
  }
};

export const updateBadgePrintStation = async (
  expoId: string,
  stationId: string,
  paused: boolean,
) => {
  try {
    await clientTokenInstance.patch(stationPath(expoId, stationId), {
      paused,
    });
  } catch (error) {
    throw toError(error, '출력대 상태를 바꾸지 못했습니다.');
  }
};

/**
 * 다음 작업을 점유한다. 없거나 일시정지면 null(204).
 * 응답을 못 받았을 때는 같은 requestId 로 다시 보내야 같은 작업을 다시 받는다
 */
export const claimBadgePrintJob = async (
  expoId: string,
  stationId: string,
  sessionId: string,
  requestId: string,
): Promise<BadgePrintClaim | null> => {
  try {
    const response = await clientTokenInstance.post<BadgePrintClaim | ''>(
      `${stationPath(expoId, stationId)}/claim`,
      { sessionId, requestId },
    );
    return response.status === 204 || !response.data ? null : response.data;
  } catch (error) {
    throw toError(error, '출력 작업을 받지 못했습니다.');
  }
};

export const reportBadgePrintResult = async (
  expoId: string,
  jobId: number,
  body: {
    sessionId: string;
    claimToken: string;
    outcome: BadgePrintOutcome;
    reason?: string;
  },
) => {
  try {
    await clientTokenInstance.post(
      `${basePath(expoId)}/jobs/${jobId}/result`,
      body,
    );
  } catch (error) {
    throw toError(error, '출력 결과를 보내지 못했습니다.');
  }
};

/** 오늘 작업 중 확인이 필요한 것(기본 NEEDS_CHECK, FAILED) */
export const getBadgePrintJobs = async (
  expoId: string,
): Promise<BadgePrintJob[]> => {
  try {
    const response = await clientTokenInstance.get<{ jobs: BadgePrintJob[] }>(
      `${basePath(expoId)}/jobs`,
    );
    return response.data.jobs;
  } catch (error) {
    throw toError(error, '확인이 필요한 출력 목록을 불러오지 못했습니다.');
  }
};

/** REQUEUE 는 다시 대기열에 넣고, DONE 은 처리 완료로 닫는다. 같은 requestKey 로 다시 보내도 한 번만 처리된다 */
export const resolveBadgePrintJob = async (
  expoId: string,
  jobId: number,
  action: BadgePrintResolveAction,
  requestKey: string,
) => {
  try {
    await clientTokenInstance.post(
      `${basePath(expoId)}/jobs/${jobId}/resolve`,
      { action, requestKey },
    );
  } catch (error) {
    throw toError(error, '출력 작업을 처리하지 못했습니다.');
  }
};

/** 입장 안내용 작업 상태·출력대 조회. 이전 스캔의 요청은 signal 로 끊는다 */
export const getBadgePrintJobStatus = async (
  expoId: string,
  jobId: number,
  signal?: AbortSignal,
): Promise<BadgePrintJobStatusResponse> => {
  try {
    const response = await clientTokenInstance.get<BadgePrintJobStatusResponse>(
      `${basePath(expoId)}/jobs/${jobId}`,
      { signal },
    );
    return response.data;
  } catch (error) {
    throw toError(error, '명찰 출력대를 조회하지 못했습니다.');
  }
};
