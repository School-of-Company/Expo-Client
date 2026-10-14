import type { TrainingProgramItem } from '@/shared/types/program/list/type';

/**
 * 연수 프로그램별 신청에서 서버 계약이 아직 확정되지 않은 부분을 한곳에 모았다.
 * TODO(api): 참가자용 공개 프로그램/회차 목록과 프로그램-폼 연결은 Expo-Application-Server#43 에서 확정된다.
 * 지금은 프로그램 응답에 `formId` 가 실리면 그 폼을 쓰고, 없으면 신청할 수 없는 프로그램으로 본다.
 */
export const getProgramFormId = (program: TrainingProgramItem) =>
  (program as TrainingProgramItem & { formId?: string }).formId;

/** 프로그램 하나의 제출 결과. 한 프로그램의 실패가 다른 프로그램의 성공 표시를 가리지 않게 따로 둔다. */
export type ProgramApplyOutcome =
  | { kind: 'CONFIRMED' | 'WAITING' | 'PROCESSING' }
  | { kind: 'FAILED'; message: string };

export const OUTCOME_LABEL: Record<
  Exclude<ProgramApplyOutcome['kind'], 'FAILED'>,
  string
> = {
  CONFIRMED: '신청이 확정되었습니다.',
  WAITING: '대기 접수되었습니다. 자리가 나면 안내드립니다.',
  PROCESSING:
    '처리 중입니다. 잠시 후 같은 신청서로 다시 눌러 결과를 확인해주세요.',
};
