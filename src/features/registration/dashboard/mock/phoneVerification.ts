// 서버 연결 전 예시 데이터. Expo-User-Server#137 배포 후 API 로 교체
export const PHONE_VERIFICATION_ISSUE = 'Expo-User-Server#137';

export interface PhoneVerificationSummary {
  /** 휴대전화 인증을 마친 건수 */
  verifiedCount: number;
}

const MOCK_PHONE_VERIFICATION: PhoneVerificationSummary = {
  verifiedCount: 1284,
};

/** 박람회 휴대전화 인증 집계. API 가 생기면 이 함수만 useQuery 로 바꾼다 */
export const usePhoneVerificationSummary = (
  _expoId: string,
): PhoneVerificationSummary => MOCK_PHONE_VERIFICATION;
