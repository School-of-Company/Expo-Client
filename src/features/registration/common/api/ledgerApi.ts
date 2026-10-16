import { ApiError, toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// Expo-Application-Server AdminApplicationController 의 관리자 경로 응답 형식
export type ProgramSessionType = 'STANDARD' | 'TRAINING';

export type AdminApplicationStatus = 'CONFIRMED' | 'WAITING' | 'CANCELLED';

export type AdminApplicationSort =
  | 'CREATED_DESC'
  | 'CREATED_ASC'
  | 'RECEIPT_DESC'
  | 'RECEIPT_ASC'
  /** 제출 당시 제목 */
  | 'PROGRAM_ASC'
  | 'PROGRAM_DESC'
  /** 제출 당시 회차 일시 */
  | 'SESSION_ASC'
  | 'SESSION_DESC';

export type AdminOccupation =
  | 'KINDERGARTEN_STUDENT'
  | 'ELEMENTARY_STUDENT'
  | 'MIDDLE_SCHOOL_STUDENT'
  | 'HIGH_SCHOOL_STUDENT'
  | 'SCHOOL_STAFF'
  | 'PARENT'
  | 'GENERAL'
  | 'TEACHER'
  | 'PRE_SERVICE_TEACHER';

/** 접수 당시 회차 정의 (Expo-Expo-Server ProgramDefinition) */
export interface ProgramSessionDefinition {
  programType: ProgramSessionType;
  id: number;
  title: string;
  /** ISO 지역 일시 (YYYY-MM-DDTHH:mm) */
  startedAt: string;
  endedAt: string;
  category?: 'ESSENTIAL' | 'CHOICE' | null;
  /** 현재 회차 조회에만 있다. 접수 당시 정의(definition)에는 없을 수 있다 */
  policy?: ProgramSessionPolicy | null;
  /** 현재 회차 조회의 프로그램 묶음 ID. 없으면 묶이지 않은 회차다 */
  groupId?: string | null;
}

export interface ProgramSessionPolicy {
  capacity: number;
  waitingCapacity: number;
  /** 사전·현장 정원. 둘의 합이 capacity 다. 옛 응답에는 없을 수 있다 */
  preRegistrationCapacity?: number;
  onsiteCapacity?: number;
  closed: boolean;
}

export interface AdminAttendanceSummary {
  attendeeCount: number;
  /** HH:mm */
  firstEntryTime: string | null;
  lastEntryTime: string | null;
}

export interface AdminSessionSummary {
  programType: ProgramSessionType;
  programId: number;
  totalElements: number;
  uniqueParticipants: number;
  statusCounts: Partial<Record<AdminApplicationStatus, number>>;
  attendance: AdminAttendanceSummary | null;
}

export interface AdminApplicationSummary {
  totalElements: number;
  uniqueParticipants: number;
  statusCounts: Partial<Record<AdminApplicationStatus, number>>;
  totalSessions: number;
  sessions: AdminSessionSummary[];
}

export interface AdminApplicationHistory {
  id: number;
  status: AdminApplicationStatus;
  createdAt: string;
}

export interface AdminParticipantDetail {
  participantId: number;
  name: string;
  phoneNumber: string | null;
  notificationPhoneNumber: string | null;
  occupation: AdminOccupation | null;
  /** 없으면 대표자, 있으면 그 대표자의 동행자 */
  representativeId: number | null;
  /** 연결된 연수자. 직업과 별개다 */
  linkedTraineeId: number | null;
  applicationType: string | null;
  /** User 의 현재 등록 답변. 접수 당시 답변(answers)과 다를 수 있다 */
  information: Record<string, unknown> | null;
}

export interface AdminApplicationRow {
  applicationId: string;
  /** 박람회별 접수번호. 1부터 결번 없이 늘고 바뀌지 않는다 */
  receiptNumber: number;
  participantId: number;
  traineeId: number | null;
  programType: ProgramSessionType;
  programId: number;
  groupId: string;
  status: AdminApplicationStatus;
  createdAt: string;
  formId: string;
  formVersion: number;
  /** 접수 당시 회차 정의 */
  definition: Partial<ProgramSessionDefinition>;
  /** 접수 당시 질문과 제출 답변 (임의 JSON) */
  questions: unknown;
  answers: Record<string, unknown> | null;
  /** 서버는 참가자가 하나라도 없으면 502 로 실패하므로 null 이 아니다 */
  participant: AdminParticipantDetail;
  /** 상태 변경 이력 */
  history: AdminApplicationHistory[];
}

export interface AdminApplicationPage {
  items: AdminApplicationRow[];
  totalElements: number;
  statusCounts: Partial<Record<AdminApplicationStatus, number>>;
  page: number;
  size: number;
}

/** 서버는 알 수 없거나 빈 파라미터를 400 으로 거절하므로 값이 있는 것만 보낸다 */
export interface AdminApplicationQuery {
  /** 신청 한 건 조회 */
  applicationId?: string;
  programType?: ProgramSessionType;
  programId?: number;
  groupId?: string;
  /** 쉼표로 여러 상태(CONFIRMED,WAITING) */
  status?: string;
  /** 제출 당시 회차 시작일(KST, YYYY-MM-DD) */
  eventDate?: string;
  /** 제출 당시 제목 */
  search?: string;
  /** ISO 일시. from 포함, until 제외 */
  from?: string;
  until?: string;
  /** 참가자 이름·번호 (1–50자) */
  q?: string;
  occupation?: AdminOccupation;
  sort?: AdminApplicationSort;
  page?: number;
  size?: number;
}

interface CurrentSessionPage {
  items: ProgramSessionDefinition[];
  totalElements: number;
  definitionVersion: string;
}

const basePath = (expoId: string) =>
  `/application/admin/expos/${encodeURIComponent(expoId)}/program-session-applications`;

const compactParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const getAdminApplications = async (
  expoId: string,
  query: AdminApplicationQuery,
): Promise<AdminApplicationPage> => {
  try {
    const response = await clientTokenInstance.get(basePath(expoId), {
      params: compactParams(query),
    });
    const page: AdminApplicationPage = response.data;
    // 서버는 participant: null 성공을 주지 않는다. 오면 계약 위반이므로 빈 칸으로 숨기지 않고 502 로 실패시킨다
    if (page.items.some((item) => !item.participant)) {
      throw new ApiError('User 참가자 누락', 502);
    }
    return page;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw toApiError(error, '접수 원장을 불러오지 못했습니다.');
  }
};

/** 목록과 같은 필터의 건수·고유 참가자·회차별 집계와 회차별 실제 출석 */
export const getAdminApplicationSummary = async (
  expoId: string,
  query: AdminApplicationQuery,
): Promise<AdminApplicationSummary> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/summary`,
      { params: compactParams(query) },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '신청 현황을 불러오지 못했습니다.');
  }
};

const SESSION_PAGE_SIZE = 100;

/** 접수가 없는 회차도 포함한 현재 모집 회차 전체. 다음 페이지는 같은 definitionVersion 으로 읽는다 */
export const getAdminCurrentSessions = async (
  expoId: string,
): Promise<ProgramSessionDefinition[]> => {
  const sessions: ProgramSessionDefinition[] = [];
  let definitionVersion: string | undefined;
  try {
    for (let page = 0; ; page += 1) {
      const response = await clientTokenInstance.get<CurrentSessionPage>(
        `${basePath(expoId)}/current-sessions`,
        {
          params: compactParams({
            page,
            size: SESSION_PAGE_SIZE,
            definitionVersion,
          }),
        },
      );
      const data = response.data;
      sessions.push(...data.items);
      definitionVersion = data.definitionVersion;
      if (data.items.length === 0 || sessions.length >= data.totalElements) {
        return sessions;
      }
    }
  } catch (error) {
    throw toApiError(error, '회차 목록을 불러오지 못했습니다.');
  }
};

export interface AdminCancellationResult {
  applicationId: string;
  status: 'CANCELLED';
}

/**
 * 관리자 신청 취소. 이미 취소된 신청은 다시 보내도 200 이다.
 * 서버가 취소 권한(APPLICATION_CANCEL)·취소 마감·입장 여부를 다시 검사하고, 확정 취소면 대기자를 자동 승급한다
 */
export const postAdminApplicationCancellation = async (
  expoId: string,
  applicationId: string,
): Promise<AdminCancellationResult> => {
  try {
    const response = await clientTokenInstance.post(
      `${basePath(expoId)}/${encodeURIComponent(applicationId)}/cancellation`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '신청을 취소하지 못했습니다.');
  }
};
