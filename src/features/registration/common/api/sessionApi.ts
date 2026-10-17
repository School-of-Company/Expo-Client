import axios from 'axios';
import { toServerCode } from '@/shared/libs/handler/serverMessage';
import {
  ApiError,
  getErrorStatus,
  toApiError,
} from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ProgramSessionDefinition, ProgramSessionType } from './ledgerApi';

// Expo-Application-Server AdminApplicationController 의 current-sessions
// 신청 처리 이력(activities)은 history/api/applicationActivityApi.ts 에 있다

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

// 서버가 회차 하나만 어긋나도 목록 전체를 409 로 막는다(Application #163)
const DEFINITION_MISMATCH_MESSAGE =
  '프로그램 정책 변경 중이거나 확인되지 않은 회차가 있어 회차 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

/** current-sessions 409 본문의 원인 코드 */
const CONFLICT_MESSAGE: Record<string, string> = {
  PROGRAM_DEFINITION_MISMATCH: DEFINITION_MISMATCH_MESSAGE,
  DEFINITION_VERSION_CHANGED: DEFINITION_CHANGED_MESSAGE,
};

const getErrorCode = (error: unknown): string | undefined =>
  error instanceof ApiError
    ? error.code
    : toServerCode(
        axios.isAxiosError(error) ? error.response?.data : undefined,
      );

/**
 * 400·401·403 은 서버 문구 대신 화면 안내로 통일한다.
 * 409 는 본문의 원인 코드로 정의 불일치와 버전 변경을 나눈다. 코드가 없는 이전 응답은 definitionVersion 을 보낸 후속 페이지면 버전 변경, 첫 페이지면 정의 불일치로 본다.
 * 502 는 서버가 회차 정의를 읽지 못한 경우다. 그 밖의 상태·네트워크 오류는 toApiError 로 서버 문구와 기존 처리를 그대로 쓴다
 */
const toSessionApiError = (
  error: unknown,
  fallback: string,
  hasDefinitionVersion: boolean,
): unknown => {
  const status = getErrorStatus(error);
  const code = getErrorCode(error);
  const message =
    status === 400
      ? '조회 조건이 올바르지 않습니다.'
      : status === 401
        ? '로그인이 필요합니다. 다시 로그인해주세요.'
        : status === 403
          ? '접수 조회 권한(APPLICATION_READ)이 없습니다.'
          : status === 409
            ? ((code && CONFLICT_MESSAGE[code]) ??
              (hasDefinitionVersion
                ? DEFINITION_CHANGED_MESSAGE
                : DEFINITION_MISMATCH_MESSAGE))
            : status === 502
              ? '서버가 회차 정원 정의를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.'
              : null;
  if (status && message) return new ApiError(message, status, code);
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
    throw toSessionApiError(
      error,
      '회차 목록을 불러오지 못했습니다.',
      Boolean(query.definitionVersion),
    );
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
