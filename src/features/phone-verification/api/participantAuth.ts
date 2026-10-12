import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

// Expo-User-Server ParticipantAuthController. 인증에 성공하면 서버가 PARTICIPANT_SESSION 쿠키를 발급하고,
// 신청·QR 조회 같은 참가자 API는 전화번호 대신 이 세션으로 본인을 확인한다

export interface ParticipantSession {
  expoId: string;
  /** UTC, 오프셋 없는 yyyy-MM-ddTHH:mm:ss */
  expiresAt: string;
}

/** 프록시가 { error } 로 바꿔 준 서버 문구를 꺼낸다 */
const toError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response) {
    const message = error.response.data?.error;
    return new Error(
      typeof message === 'string' && message ? message : fallback,
    );
  }
  return error;
};

export const postParticipantAuthCode = async (
  expoId: string,
  phoneNumber: string,
) => {
  try {
    await clientInstance.post('/participant-auth/code', {
      expoId,
      phoneNumber,
    });
  } catch (error) {
    throw toError(error, '인증 번호를 보내지 못했습니다.');
  }
};

export const postParticipantAuthVerify = async (
  expoId: string,
  phoneNumber: string,
  code: string,
): Promise<ParticipantSession> => {
  try {
    const { data } = await clientInstance.post('/participant-auth/verify', {
      expoId,
      phoneNumber,
      code,
    });
    return data;
  } catch (error) {
    throw toError(error, '인증 번호를 확인하지 못했습니다.');
  }
};

/** 유효한 세션이 없으면(SESSION_REQUIRED·SESSION_EXPIRED, 401) null */
export const getParticipantSession = async (
  expoId: string,
): Promise<ParticipantSession | null> => {
  try {
    const { data } = await clientInstance.get('/participant-auth/session', {
      params: { expoId },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw toError(error, '인증 상태를 확인하지 못했습니다.');
  }
};
