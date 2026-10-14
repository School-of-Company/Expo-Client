// 서버 연결 전 예시 데이터. Expo-Application-Server#108 배포 후 API 로 교체
export const PREREGISTER_OCCUPATION_ISSUE = 'Expo-Application-Server#108';

interface OccupationCount {
  confirmed: number;
  waiting: number;
}

/** 사전등록 확정·대기를 일반과 교원·예비교사로 나눈 인원 */
export interface PreregisterOccupationSplit {
  general: OccupationCount;
  teacher: OccupationCount;
}

const MOCK_PREREGISTER_OCCUPATION: PreregisterOccupationSplit = {
  general: { confirmed: 642, waiting: 18 },
  teacher: { confirmed: 215, waiting: 6 },
};

/** API 가 생기면 이 함수만 useQuery 로 바꾼다 */
export const usePreregisterOccupationSplit = (
  _expoId: string,
): PreregisterOccupationSplit => MOCK_PREREGISTER_OCCUPATION;
