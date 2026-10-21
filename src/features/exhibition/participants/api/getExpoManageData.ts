import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  ParticipantResponse,
  TraineeResponse,
} from '@/shared/types/exhibition/participants/type';

// 서버(GET /trainee/{expoId})는 이름 필터만 받고 행사 전체 연수자를 배열로 돌려준다. 날짜·페이지 구분은 없다
export const getTraineeExpoManageData = async (
  id: string,
): Promise<TraineeResponse> => {
  try {
    const response = await clientTokenInstance.get(`/trainee/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '연수자 불러오기 실패');
    }
    throw error;
  }
};

export const getParticipantExpoManageData = async (
  id: string,
  page: number,
  date: string,
  sessionId?: number,
  withoutSession = false,
): Promise<ParticipantResponse> => {
  try {
    const response = await clientTokenInstance.get(`/participant/${id}`, {
      // sessionId가 있으면 서버가 date를 무시한다. withoutSession 은 date에 회차 없이 입장한 참가자(현장등록)만 고른다
      params: {
        page: page - 1,
        size: 7,
        date,
        sessionId,
        ...(withoutSession && { withoutSession: true }),
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '참가자 불러오기 실패');
    }
    throw error;
  }
};
