import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ParticipantType } from '../constant/participant';

export interface PreRegisterSession {
  title: string;
  startedAt: string;
  endedAt: string;
  place: string;
  capacity: number;
  waitingCapacity: number;
  confirmedCount: number;
  waitingCount: number;
}

export interface ManagedParticipant {
  participantId: number;
  name: string;
  region: string;
  participantType: ParticipantType;
  affiliation?: string;
  // 이 회차에 이미 신청했는지
  isApplied: boolean;
}

export interface PreRegisterDetail {
  session: PreRegisterSession;
  participants: ManagedParticipant[];
}

export type PreRegisterBody =
  | { participantId: number }
  | {
      name: string;
      region: string;
      participantType: ParticipantType;
      affiliation?: string;
    };

// TODO(api): 회차 선택 화면이 생기기 전까지 sessionId 없이 들어오면
// 서버가 현재 접수 중인 기본 회차를 돌려준다고 가정한다
const sessionPath = (expoId: string, sessionId: string) =>
  sessionId
    ? `/pre-register/${expoId}/sessions/${sessionId}`
    : `/pre-register/${expoId}`;

// TODO(api): 새 서버에서 만들 엔드포인트. 스펙 확정되면 경로/응답 맞출 것.
// 서버가 SMS 인증 세션으로 본인 번호를 식별한다고 가정한다.
export const getPreRegister = async (
  expoId: string,
  sessionId: string,
): Promise<PreRegisterDetail> => {
  try {
    const response = await clientInstance.get(sessionPath(expoId, sessionId));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 정보 불러오기 실패');
    }
    throw error;
  }
};

// TODO(api): 새 서버에서 만들 엔드포인트. 기존 참가자는 participantId 만 보낸다
export const postPreRegister = async (
  expoId: string,
  sessionId: string,
  body: PreRegisterBody,
) => {
  try {
    await clientInstance.post(sessionPath(expoId, sessionId), body);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 실패');
    }
    throw error;
  }
};
