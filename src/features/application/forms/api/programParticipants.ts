import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ProgramType } from '@/shared/types/program/list/type';
import { OwnerParticipant } from './myApplications';

export interface ProgramParticipant {
  participant: OwnerParticipant;
  eligible: boolean;
  // 이 회차에 이미 다른 학생과 신청한 보호자(계약 미확정 가정). 재사용되어 폼·좌석이 늘지 않는다
  guardianApplied?: boolean;
}

export interface ProgramParticipants {
  // false 면 확정된 사전등록이 없다
  registered: boolean;
  participants: ProgramParticipant[];
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
): Promise<ProgramParticipants> => {
  try {
    const { data } = await clientInstance.get<ProgramParticipants>(
      `/application/expos/${encodeURIComponent(expoId)}/program-sessions/${programType}/${programId}/participants`,
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
