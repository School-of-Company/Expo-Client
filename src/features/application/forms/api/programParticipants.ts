import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ProgramType } from '@/shared/types/program/list/type';
import { OwnerParticipant } from './myApplications';

// 신청 불가 사유 (Expo-Application-Server ProgramIneligibleReason)
export type ProgramIneligibleReason =
  | 'OCCUPATION_NOT_ALLOWED'
  | 'PREREGISTRATION_NOT_CONFIRMED'
  | 'GROUP_ALREADY_APPLIED'
  | 'TIME_CONFLICT';

export interface ProgramParticipant {
  participant: OwnerParticipant;
  eligible: boolean;
  // 신청할 수 없는 사유. 같은 묶음에 이미 신청했으면 GROUP_ALREADY_APPLIED
  ineligibleReason?: ProgramIneligibleReason | null;
}

// 조회 시점의 참고값이며 최종 판정은 서버가 한다. 서로 다른 값이라 섞어 쓰지 않는다
export interface ProgramCapacity {
  capacity: number;
  confirmedCount: number;
  // 정원-확정 인원. 즉시 확정을 보장하지 않는다
  remaining: number;
  waitingCapacity: number;
  // 실제 대기 인원
  waitingCount: number;
  // 대기 정원-실제 대기 인원
  waitingRemaining: number;
}

export interface ProgramChannelCapacity {
  name: string;
  allowedOccupations: string[];
  capacity: ProgramCapacity;
}

export interface ProgramParticipants {
  // false 면 확정된 사전등록이 없다
  registered: boolean;
  participants: ProgramParticipant[];
  capacity?: ProgramCapacity | null;
  channels?: ProgramChannelCapacity[];
}

const ERRORS: Record<number, string> = {
  400: '잘못된 요청입니다. 다시 확인해주세요.',
  401: '참가자 인증이 필요하거나 인증이 만료되었습니다. 다시 인증해주세요.',
  404: '프로그램을 찾을 수 없습니다.',
  502: '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '연동 서버를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

export const getProgramParticipants = async (
  expoId: string,
  programType: ProgramType,
  programId: number,
  onsite = false,
): Promise<ProgramParticipants> => {
  try {
    const { data } = await clientInstance.get<ProgramParticipants>(
      `/application/expos/${encodeURIComponent(expoId)}/program-sessions/${programType}/${programId}/participants${onsite ? '?onsite=true' : ''}`,
    );
    return data;
  } catch (error) {
    const status = getErrorStatus(error);
    throw status === undefined
      ? error
      : new ApiError(
          ERRORS[status] ?? '신청 가능한 참가자를 불러오지 못했습니다.',
          status,
        );
  }
};
