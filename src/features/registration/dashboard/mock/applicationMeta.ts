// 서버 연결 전 예시 데이터. Expo-Application-Server#107 배포 후 API 로 교체
export const APPLICATION_META_ISSUE = 'Expo-Application-Server#107';

/** 원장 행에 붙을 접수번호·소속·접수 채널 */
export interface ApplicationMeta {
  receiptNumber: string;
  /** 학교·지역 */
  affiliation: string;
  channel: string;
}

const MOCK_AFFILIATIONS = ['광주소프트웨어마이스터고', '광주 광산구', '-'];

/** 원장 응답에 필드가 생기면 행 값을 그대로 쓰도록 이 함수만 바꾼다 */
export const getApplicationMeta = (index: number): ApplicationMeta => ({
  receiptNumber: `#${String(index + 1).padStart(4, '0')}`,
  affiliation: MOCK_AFFILIATIONS[index % MOCK_AFFILIATIONS.length],
  channel: '일반',
});
