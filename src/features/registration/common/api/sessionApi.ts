import {
  ApiError,
  getErrorStatus,
  toApiError,
} from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  AdminApplicationStatus,
  ProgramSessionDefinition,
  ProgramSessionType,
} from './ledgerApi';

// Expo-Application-Server AdminApplicationController 의 current-sessions · activities

const basePath = (expoId: string) =>
  `/application/admin/expos/${encodeURIComponent(expoId)}/program-session-applications`;

const compactParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const DEFINITION_CHANGED_MESSAGE =
  '회차 정의가 바뀌었습니다. 다시 조회해주세요.';

/**
 * 400·401·403 은 서버 문구 대신 화면 안내로 통일한다. 409(definitionVersion 변경)는 current-sessions 에만 있다.
 * 그 밖의 상태·네트워크 오류는 toApiError 로 서버 문구와 기존 처리를 그대로 쓴다
 */
const toSessionApiError = (
  error: unknown,
  fallback: string,
  { definitionVersion = false } = {},
): unknown => {
  const status = getErrorStatus(error);
  const message =
    status === 400
      ? '조회 조건이 올바르지 않습니다.'
      : status === 401
        ? '로그인이 필요합니다. 다시 로그인해주세요.'
        : status === 403
          ? '접수 조회 권한(APPLICATION_READ)이 없습니다.'
          : status === 409 && definitionVersion
            ? DEFINITION_CHANGED_MESSAGE
            : null;
  if (status && message) return new ApiError(message, status);
  return error instanceof ApiError ? error : toApiError(error, fallback);
};

export interface CurrentSessionQuery {
  programType?: ProgramSessionType;
  programId?: number;
  groupId?: string;
  page?: number;
  size?: number;
  /** 첫 페이지는 비우고, 후속 페이지는 응답의 값을 그대로 보낸다 */
  definitionVersion?: string;
}

/** Expo 서버 응답을 Application 서버가 검증해 그대로 전달한다. policy 는 검증 대상이 아니다 */
export type CurrentSession = ProgramSessionDefinition & {
  expoId: string;
  groupId: string;
  revision: number;
};

export interface CurrentSessionPage {
  expoId: string;
  items: CurrentSession[];
  page: number;
  size: number;
  totalElements: number;
  definitionVersion: string;
}

/** 접수가 없는 현재 회차도 포함한다. 삭제된 과거 회차는 없다 — 원장 이력으로 조회한다 */
export const getCurrentSessionPage = async (
  expoId: string,
  query: CurrentSessionQuery,
): Promise<CurrentSessionPage> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/current-sessions`,
      { params: compactParams(query) },
    );
    return response.data;
  } catch (error) {
    throw toSessionApiError(error, '회차 목록을 불러오지 못했습니다.', {
      definitionVersion: true,
    });
  }
};

const SESSION_PAGE_SIZE = 100;

/**
 * 현재 회차 전체. 모든 페이지를 첫 응답의 definitionVersion 으로 읽는다.
 * 도중에 409(정의 변경)가 나면 모은 페이지를 버리고 오류를 던진다 — 낡은 페이지를 이어 붙이지 않는다.
 */
export const getAllCurrentSessions = async (
  expoId: string,
  query: Pick<
    CurrentSessionQuery,
    'programType' | 'programId' | 'groupId'
  > = {},
): Promise<ProgramSessionDefinition[]> => {
  const sessions: ProgramSessionDefinition[] = [];
  let definitionVersion: string | undefined;
  for (let page = 0; ; page += 1) {
    const data = await getCurrentSessionPage(expoId, {
      ...query,
      page,
      size: SESSION_PAGE_SIZE,
      definitionVersion,
    });
    sessions.push(...data.items);
    definitionVersion ??= data.definitionVersion;
    // 후속 페이지의 version 이 첫 값과 다르면 정의가 바뀐 것이다. 서버 409 와 같게 취급한다
    if (data.definitionVersion !== definitionVersion) {
      throw new ApiError(DEFINITION_CHANGED_MESSAGE, 409);
    }
    if (data.items.length === 0 || sessions.length >= data.totalElements) {
      return sessions;
    }
  }
};

export type ApplicationActivityAction = 'APPLIED' | 'CANCELLED' | 'PROMOTED';

export interface ApplicationActivity {
  id: number;
  applicationId: string;
  participantId: number;
  programType: ProgramSessionType;
  programId: number;
  /** 서버가 처리 유형을 늘릴 수 있어 문자열로 받는다 (ApplicationActivityAction 참고) */
  action: string;
  status: AdminApplicationStatus;
  /** 관리자 취소만 값이 있다. null 은 과거·자동 처리 */
  actorId: number | null;
  createdAt: string;
}

export interface ApplicationActivityPage {
  items: ApplicationActivity[];
  totalElements: number;
  page: number;
  size: number;
}

/** from 포함·until 제외. 서버는 빈 파라미터를 거절하므로 값이 있는 것만 보낸다 */
export interface ApplicationActivityQuery {
  action?: ApplicationActivityAction;
  applicationId?: string;
  from?: string;
  until?: string;
  page: number;
  size: number;
}

/** 신청·취소·대기 승급 처리 이력, 시간 역순. 모집 변경·문자 발송 이력은 각 원천 서비스 소관이다 */
export const getApplicationActivities = async (
  expoId: string,
  query: ApplicationActivityQuery,
): Promise<ApplicationActivityPage> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/activities`,
      { params: compactParams(query) },
    );
    return response.data;
  } catch (error) {
    throw toSessionApiError(error, '처리 이력을 불러오지 못했습니다.');
  }
};
