// 서버 연결 전 예시 데이터. Expo-Expo-Server#111 배포 후 API 로 교체
import { ScheduleProgram } from '../../common';

/** AUTO 는 빈자리가 나면 대기자를 바로 승급하고, MANUAL 은 관리자가 승급한다 */
export type PromotionMode = 'AUTO' | 'MANUAL';

export interface PromotionPolicy {
  mode: PromotionMode;
  /** 이 시각이 지나면 AUTO 승급을 멈춘다. 로컬 'YYYY-MM-DDTHH:mm' */
  autoPromotionEndedAt: string | null;
}

/** 프로그램별 대기자 승급 정책 예시. 같은 ID 에는 늘 같은 값을 돌려준다 */
export const getPromotionPolicyMock = (
  program: ScheduleProgram,
): PromotionPolicy => ({
  mode: program.id % 4 === 0 ? 'MANUAL' : 'AUTO',
  autoPromotionEndedAt: null,
});
