import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { ParticipantType } from '../constant/participant';

export interface MyParticipant {
  participantId: number;
  participantType: ParticipantType;
  // 교사·예비교사만 입력
  affiliation?: string;
  name?: string;
}

// 신청 1건에 참여자 최대 5명. 첫 번째 참여자가 대표자(인증한 번호의 주인)
export interface MyApplication {
  applicationId: number;
  applicationType: ApplicationType;
  phoneNumber: string;
  sessionStartedAt: string;
  participants: MyParticipant[];
}

// TODO(api): 새 서버에서 만들 엔드포인트. 스펙 확정되면 경로/응답 맞출 것.
// 서버가 SMS 인증 세션으로 본인 번호를 식별한다고 가정한다.
export const getMyApplications = async (
  expoId: string,
): Promise<MyApplication[]> => {
  if (expoId === 'mock') return MOCK_MY_APPLICATIONS;

  try {
    const response = await clientInstance.get(`/application/my/${expoId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 내역 불러오기 실패');
    }
    throw error;
  }
};

// TODO(api): 새 서버에서 만들 엔드포인트. 참여자 1명 단위로 취소
export const deleteMyParticipant = async (participantId: number) => {
  try {
    await clientInstance.delete(
      `/application/my/participants/${participantId}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 취소 실패');
    }
    throw error;
  }
};

// TODO(dev-mock): 서버 복구 후 제거
const MOCK_MY_APPLICATIONS: MyApplication[] = [
  {
    applicationId: 1,
    applicationType: 'PRE',
    phoneNumber: '01012345678',
    sessionStartedAt: '2026-10-31T09:30:00',
    participants: [
      { participantId: 1, participantType: 'GENERAL' },
      { participantId: 2, participantType: 'ELEMENTARY' },
      {
        participantId: 3,
        participantType: 'TEACHER',
        affiliation: '광주초',
        name: '홍길동',
      },
      {
        participantId: 4,
        participantType: 'PRE_TEACHER',
        affiliation: '광주교대',
        name: '김예비',
      },
    ],
  },
];
