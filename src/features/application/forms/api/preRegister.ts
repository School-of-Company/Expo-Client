import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

/** 화면 안내용 값. 최종 정원 판정은 제출 시 서버가 다시 한다. */
export interface PreRegisterCapacity {
  sessionId: number;
  /** 남은 자리 */
  remaining: number;
  /** 확정으로 받는 1회 신청 최대 인원(대표자 포함) */
  maxApplicants: number;
  /**
   * 대기로 받는 1회 신청 최대 인원(대표자 포함). 확정 자리가 모자라면 일행 전체가 대기로 접수된다.
   * 아직 내려주지 않는 서버면 없으므로 0(대기 불가)으로 본다.
   */
  maxWaitingApplicants?: number;
}

const CAPACITY_ERRORS: Record<number, string> = {
  400: '잘못된 박람회 또는 회차 정보입니다.',
  404: '존재하지 않는 회차입니다.',
  409: '회차가 삭제되었거나 변경 중입니다.',
  502: '서버 응답에 문제가 있어 잔여석을 확인할 수 없습니다.',
  503: '연동 서버를 사용할 수 없어 잔여석을 확인할 수 없습니다.',
};

export const getPreRegisterCapacity = async (
  expoId: string,
  sessionId: string,
): Promise<PreRegisterCapacity> => {
  // 회차 목록 공개 API 가 없어 링크의 sessionId 로만 회차를 안다
  if (!sessionId)
    throw new Error(
      '회차가 지정되지 않았습니다. 안내받은 링크로 다시 접속해 주세요.',
    );
  // 서버는 양수 int64 만 받는다(0 이하는 400). 아니면 요청하지 않고 400 과 같이 안내한다
  if (!/^[1-9]\d*$/.test(sessionId)) throw new Error(CAPACITY_ERRORS[400]);
  try {
    const response = await clientInstance.get(
      `/application/expos/${expoId}/preregister-sessions/${sessionId}/capacity`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        CAPACITY_ERRORS[error.response.status] ||
          '잔여석 정보를 불러오지 못했습니다.',
      );
    }
    throw error;
  }
};
