// 서버 연결 전 예시 데이터. Expo-Attendance-Server#132 배포 후 API 로 교체
export const ACTIVE_QR_ISSUE = 'Expo-Attendance-Server#132';

export interface ActiveQrSummary {
  /** 지금 스캔을 받는 회차 QR 수 */
  activeCount: number;
}

const MOCK_ACTIVE_QR: ActiveQrSummary = { activeCount: 3 };

/** API 가 생기면 이 함수만 useQuery 로 바꾼다 */
export const useActiveQrSummary = (_expoId: string): ActiveQrSummary =>
  MOCK_ACTIVE_QR;
