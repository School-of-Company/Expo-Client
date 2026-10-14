// 서버 연결 전 예시 데이터. Expo-Expo-Server#110 배포 후 API 로 교체
import { ProgramSessionType } from '../../common/api/ledgerApi';

export const PROGRAM_CODE_ISSUE = 'Expo-Expo-Server#110';

const CODE_PREFIX: Record<ProgramSessionType, string> = {
  STANDARD: 'P',
  TRAINING: 'T',
};

/** 프로그램 응답에 코드가 생기면 그 값을 쓰도록 이 함수만 바꾼다 */
export const getProgramCode = (
  programType: ProgramSessionType,
  index: number,
) => `${CODE_PREFIX[programType]}-${String(index + 1).padStart(2, '0')}`;
