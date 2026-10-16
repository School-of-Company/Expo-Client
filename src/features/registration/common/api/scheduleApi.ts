import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  Program,
  ProgramPolicy,
  StandardProgramRequest,
  TrainingCategory,
} from '@/shared/types/program/list/type';
import { ProgramSessionType } from './ledgerApi';

// Expo-Expo-Server 사전등록 회차·프로그램 모집 정책 관리자 경로 형식

/** 박람회 단위 사전등록 회차. 일시는 UTC 오프셋이 있는 ISO 8601 이다 */
export interface PreregisterSessionDefinition {
  title: string;
  startedAt: string;
  endedAt: string;
  place: string;
  /** 1 이상 */
  capacity: number;
  waitingCapacity: number;
  closed: boolean;
  /** null 이면 참가자 취소를 막는다 */
  cancelEndedAt: string | null;
}

export interface PreregisterSession extends PreregisterSessionDefinition {
  id: number;
  expoId: string;
  revision: number;
}

// 프로그램·모집 정책 형식은 박람회 화면과 같이 shared 타입을 쓴다
export type {
  ProgramChannel,
  ProgramGuardianPolicy,
  ProgramPolicy,
  TrainingCategory,
} from '@/shared/types/program/list/type';

/** 시각은 ISO 지역 일시 (YYYY-MM-DDTHH:mm). 연수 프로그램만 category 가 있다 */
export type ScheduleProgram = Omit<Program, 'expoId'> & {
  category?: TrainingCategory;
};

/** 프로그램 생성·수정 본문. 시각은 'yyyy-MM-dd HH:mm' 이고 policy 가 null 이면 기존 정책을 유지한다 */
export type ScheduleProgramRequest = StandardProgramRequest & {
  category?: TrainingCategory;
  policy: ProgramPolicy | null;
};

const expoPath = (expoId: string) => `/expo/${encodeURIComponent(expoId)}`;

const sessionPath = (expoId: string, sessionId: number) =>
  `${expoPath(expoId)}/preregister-sessions/${sessionId}`;

const programBase = (programType: ProgramSessionType) =>
  programType === 'TRAINING' ? '/training' : '/standard';

export const getPreregisterSessions = async (
  expoId: string,
): Promise<PreregisterSession[]> => {
  try {
    const response = await clientTokenInstance.get(
      `${expoPath(expoId)}/preregister-sessions`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 회차를 불러오지 못했습니다.');
  }
};

export const postPreregisterSession = async (
  expoId: string,
  definition: PreregisterSessionDefinition,
): Promise<PreregisterSession> => {
  try {
    const response = await clientTokenInstance.post(
      `${expoPath(expoId)}/preregister-sessions`,
      definition,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 회차를 만들지 못했습니다.');
  }
};

/** 신청 이력이 있는 회차는 마감·재개만 바꿀 수 있다 */
export const patchPreregisterSession = async (
  expoId: string,
  sessionId: number,
  revision: number,
  definition: PreregisterSessionDefinition,
): Promise<void> => {
  try {
    await clientTokenInstance.patch(sessionPath(expoId, sessionId), {
      revision,
      definition,
    });
  } catch (error) {
    throw toApiError(error, '사전등록 회차를 수정하지 못했습니다.');
  }
};

export const deletePreregisterSession = async (
  expoId: string,
  sessionId: number,
  revision: number,
): Promise<void> => {
  try {
    await clientTokenInstance.delete(sessionPath(expoId, sessionId), {
      params: { revision },
    });
  } catch (error) {
    throw toApiError(error, '사전등록 회차를 삭제하지 못했습니다.');
  }
};

/** 서버에 남은 중단된 변경을 다시 처리한다. 본문과 revision 은 필요 없다 */
export const retryPreregisterSessionChange = async (
  expoId: string,
  sessionId: number,
): Promise<void> => {
  try {
    await clientTokenInstance.post(
      `${sessionPath(expoId, sessionId)}/changes/retry`,
    );
  } catch (error) {
    throw toApiError(error, '회차 변경을 다시 처리하지 못했습니다.');
  }
};

/**
 * 신청 이력이 있어 Application 에서 대기가 미적용인 회차에 Expo 현재 대기 정원을 적용한다.
 * expected 는 관리자가 확인한 회차 waitingCapacity 이며 Application 이 관찰한 값과 다르면 409 이다
 */
export const putPreregisterWaitingCapacity = async (
  expoId: string,
  sessionId: number,
  expected: number,
): Promise<void> => {
  try {
    await clientTokenInstance.put(
      `${sessionPath(expoId, sessionId)}/waiting-capacity`,
      { expected },
    );
  } catch (error) {
    throw toApiError(error, '대기 정원을 적용하지 못했습니다.');
  }
};

export const getSchedulePrograms = async (
  expoId: string,
): Promise<ScheduleProgram[]> => {
  try {
    const id = encodeURIComponent(expoId);
    const [trainings, standards] = await Promise.all([
      clientTokenInstance.get<ScheduleProgram[]>(`/training/program/${id}`),
      clientTokenInstance.get<ScheduleProgram[]>(`/standard/program/${id}`),
    ]);
    return [
      ...trainings.data.map((program) => ({
        ...program,
        programType: 'TRAINING' as const,
      })),
      ...standards.data.map((program) => ({
        ...program,
        programType: 'STANDARD' as const,
      })),
    ];
  } catch (error) {
    throw toApiError(error, '프로그램 목록을 불러오지 못했습니다.');
  }
};

export const postScheduleProgram = async (
  expoId: string,
  programType: ProgramSessionType,
  data: ScheduleProgramRequest,
): Promise<void> => {
  try {
    await clientTokenInstance.post(
      `${programBase(programType)}/${encodeURIComponent(expoId)}`,
      data,
    );
  } catch (error) {
    throw toApiError(error, '프로그램을 만들지 못했습니다.');
  }
};

export const patchScheduleProgram = async (
  program: Pick<ScheduleProgram, 'id' | 'programType' | 'revision'>,
  data: ScheduleProgramRequest,
): Promise<void> => {
  try {
    await clientTokenInstance.patch(
      `${programBase(program.programType)}/${program.id}`,
      { ...data, id: program.id, revision: program.revision },
    );
  } catch (error) {
    throw toApiError(error, '프로그램을 수정하지 못했습니다.');
  }
};

export const deleteScheduleProgram = async (
  program: Pick<ScheduleProgram, 'id' | 'programType'>,
): Promise<void> => {
  try {
    await clientTokenInstance.delete(
      `${programBase(program.programType)}/${program.id}`,
    );
  } catch (error) {
    throw toApiError(error, '프로그램을 삭제하지 못했습니다.');
  }
};

export type ProgramPolicyBulkStatus =
  | 'UPDATED'
  | 'UNCHANGED'
  | 'SKIPPED_NO_POLICY'
  | 'FAILED';

export interface ProgramPolicyBulkResult {
  programType: ScheduleProgram['programType'];
  id: number;
  title: string;
  status: ProgramPolicyBulkStatus;
  /** FAILED 사유 */
  reason: string | null;
}

/**
 * 모집 정책이 있는 모든 프로그램의 신청기간을 한 번에 바꾼다(Expo-Expo-Server#113).
 * 검증에 걸린 프로그램만 FAILED 로 오고, 같은 요청을 다시 보내면 결과가 빈 목록일 수 있다
 */
export const patchProgramApplicationPeriod = async (
  expoId: string,
  period: { applicationStartedAt: string; applicationEndedAt: string },
): Promise<ProgramPolicyBulkResult[]> => {
  try {
    const response = await clientTokenInstance.patch<{
      results: ProgramPolicyBulkResult[];
    }>(
      `/expo/${encodeURIComponent(expoId)}/programs/application-period`,
      period,
    );
    return response.data.results ?? [];
  } catch (error) {
    throw toApiError(error, '신청기간을 일괄 적용하지 못했습니다.');
  }
};
