import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

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

// TODO(api): 회차 정의는 박람회 서비스, 확정·대기 인원은 신청 서비스가 내려주기로 했고
// 공개 경로와 응답은 아직 정해지지 않았다(Expo-Application-Server#34). 계약이 나오면 맞춘다.
// sessionId 없이 들어오면 현재 접수 중인 기본 회차를 돌려준다고 가정한다.
const sessionPath = (expoId: string, sessionId: string) =>
  sessionId
    ? `/pre-register/${expoId}/sessions/${sessionId}`
    : `/pre-register/${expoId}`;

export const getPreRegisterSession = async (
  expoId: string,
  sessionId: string,
): Promise<PreRegisterSession> => {
  try {
    const response = await clientInstance.get(sessionPath(expoId, sessionId));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회차 정보 불러오기 실패');
    }
    throw error;
  }
};
