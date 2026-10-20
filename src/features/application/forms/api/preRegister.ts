import axios from 'axios';
import { fromOffsetDateTime } from '@/features/registration/common/lib/dateTime';
import clientInstance from '@/shared/libs/http/clientInstance';

/** 화면 안내용 값. 최종 정원 판정은 제출 시 서버가 다시 한다. */
export interface PreRegisterCapacity {
  sessionId: number;
  /** 남은 자리 */
  remaining: number;
  /** 확정으로 받는 1회 신청 최대 인원(대표자 포함) */
  maxApplicants: number;
  /** 대기 도입 이후 서버가 주는 값. 구형 응답에는 없다. */
  confirmed?: number;
  waiting?: number;
  /**
   * 대기로 받는 1회 신청 최대 인원(대표자 포함). 확정 자리가 모자라면 일행 전체가 대기로 접수된다.
   * 내려주지 않으면 0(대기 불가)으로 본다.
   */
  maxWaitingApplicants?: number;
  /**
   * 교원·예비교사와 그 외를 따로 받는 회차(Application #173)만 있다. 대기를 받지 않고, 한쪽 좌석만 모자라도
   * 일행 전체가 거절된다. 세부 필드는 #643 에서 쓴다
   */
  targetSeats?: object | null;
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
  // 회차는 링크의 sessionId 로 정한다. 없으면 화면이 회차 목록에서 고르게 한다
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

/** 참가자용 사전등록 회차(Expo GET /expo/{expoId}/preregister-sessions/public). 정원은 capacity 로 따로 본다 */
export interface PublicPreregisterSession {
  id: number;
  title: string;
  /** 서버는 UTC(`...Z`)로 주고, 화면에는 로컬 'YYYY-MM-DDTHH:mm' 로 바꿔 넘긴다 */
  startedAt: string;
  endedAt: string;
  place: string | null;
  /** 관리자가 접수를 마감한 회차. 끝난 회차와 함께 목록에 그대로 온다 */
  closed: boolean;
  cancelEndedAt: string | null;
}

const SESSION_LIST_ERRORS: Record<number, string> = {
  404: '박람회를 찾을 수 없습니다.',
  502: '서버 응답에 문제가 있어 회차를 불러오지 못했습니다.',
  503: '연동 서버를 사용할 수 없어 회차를 불러오지 못했습니다.',
};

export const getPublicPreregisterSessions = async (
  expoId: string,
): Promise<PublicPreregisterSession[]> => {
  try {
    const response = await clientInstance.get<PublicPreregisterSession[]>(
      `/expo/${encodeURIComponent(expoId)}/preregister-sessions/public`,
    );
    // 일시를 문자열 그대로 자르면 UTC 시각이 보이므로 로컬 시각으로 바꾼다
    return response.data.map((session) => ({
      ...session,
      startedAt: fromOffsetDateTime(session.startedAt) ?? session.startedAt,
      endedAt: fromOffsetDateTime(session.endedAt) ?? session.endedAt,
    }));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        SESSION_LIST_ERRORS[error.response.status] ||
          '사전등록 회차를 불러오지 못했습니다.',
      );
    }
    throw error;
  }
};
