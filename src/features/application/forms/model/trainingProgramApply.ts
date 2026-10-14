import type { TrainingProgramItem } from '@/shared/types/program/list/type';

/**
 * 프로그램-폼 연결은 프로그램 응답의 `policy.formId` 다(ProgramPolicy). 정책이 없는 기존 프로그램은 신청할 수 없다.
 * TODO(api): 참가자용 공개 프로그램/회차 목록 계약은 Expo-Application-Server#43 에서 확정된다.
 */
export const getProgramFormId = (program: TrainingProgramItem) =>
  program.policy?.formId || undefined;

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
