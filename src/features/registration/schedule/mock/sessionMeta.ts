// 서버 연결 전 예시 데이터. Expo-Expo-Server#110 배포 후 API 로 교체
import { PreregisterSession } from '../../common';

/** 사전등록 회차에 더해질 운영 정보. 서버 응답 필드 이름은 바뀔 수 있다 */
export interface SessionMeta {
  /** 입장 채널(출입구) 수 */
  channelCount: number;
}

/** 서버 값 대신 쓰는 예시. 같은 ID 에는 늘 같은 값을 돌려준다 */
export const getSessionMetaMock = (
  session: PreregisterSession,
): SessionMeta => ({
  channelCount: (session.id % 2) + 1,
});
