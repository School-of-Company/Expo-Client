import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { AdminOccupation, ProgramSessionType } from './ledgerApi';

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

/** 일시는 UTC 오프셋이 있는 ISO 8601 이다 */
export interface ProgramPolicy {
  groupId?: string | null;
  formId?: string | null;
  allowedOccupations?: AdminOccupation[];
  capacity?: number;
  waitingCapacity?: number;
  applicationStartedAt?: string | null;
  applicationEndedAt?: string | null;
  cancelEndedAt?: string | null;
  promotionEndedAt?: string | null;
  closed?: boolean;
}

export type TrainingCategory = 'ESSENTIAL' | 'CHOICE';

export interface ScheduleProgram {
  id: number;
  programType: ProgramSessionType;
  title: string;
  /** ISO 지역 일시 (YYYY-MM-DDTHH:mm) */
  startedAt: string;
  endedAt: string;
  /** 연수 프로그램만 있다 */
  category?: TrainingCategory;
  groupId: string | null;
  /** null 이면 정책이 없는 기존 프로그램이다 */
  policy: ProgramPolicy | null;
  revision: number;
  /** 진행 중 변경의 다음 버전. 있으면 변경이 끝나지 않은 상태다 */
  pendingRevision: number | null;
}

/** 프로그램 생성·수정 본문. 시각은 'yyyy-MM-dd HH:mm' 이고 policy 가 null 이면 기존 정책을 유지한다 */
export interface ScheduleProgramRequest {
  title: string;
  startedAt: string;
  endedAt: string;
  category?: TrainingCategory;
  policy: ProgramPolicy | null;
}

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

/** 박람회의 중단된 프로그램 변경을 다시 처리한다 */
export const retryProgramChanges = async (expoId: string): Promise<void> => {
  try {
    await clientTokenInstance.post(`${expoPath(expoId)}/program-changes/retry`);
  } catch (error) {
    throw toApiError(error, '프로그램 변경을 다시 처리하지 못했습니다.');
  }
};
