// 서버 연결 전 예시 데이터. Expo-Application-Server#108 배포 후 API 로 교체
export const APPLICATION_TRAFFIC_ISSUE = 'Expo-Application-Server#108';

export interface ApplicationTraffic {
  today: {
    /** 새로고침·탭 이동을 포함한 조회 수 */
    pageViews: number;
    /** 같은 접속자는 하루 1회로 센다 */
    uniqueVisitors: number;
  };
  total: {
    pageViews: number;
    /** 일별 고유 접속자 합 */
    uniqueVisitors: number;
  };
}

const MOCK_APPLICATION_TRAFFIC: ApplicationTraffic = {
  today: { pageViews: 3420, uniqueVisitors: 812 },
  total: { pageViews: 48210, uniqueVisitors: 9655 },
};

/** 참가자 신청화면 조회 집계. API 가 생기면 이 함수만 useQuery 로 바꾼다 */
export const useApplicationTraffic = (_expoId: string): ApplicationTraffic =>
  MOCK_APPLICATION_TRAFFIC;
