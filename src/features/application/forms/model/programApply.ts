import { OCCUPATION_LABEL } from '@/features/registration/common/model/ledger';
import { formatFormPeriod } from './formPeriodStatus';
import type {
  ProgramCapacity,
  ProgramIneligibleReason,
} from '../api/programParticipants';
import type {
  ProgramOccupation,
  ProgramPolicy,
  Program,
} from '@/shared/types/program/list/type';

/**
 * 프로그램-폼 연결은 프로그램 응답의 `policy.formId` 다(ProgramPolicy). 정책이 없는 기존 프로그램은 신청할 수 없다.
 */
export const getProgramFormId = (program: Pick<Program, 'policy'>) =>
  program.policy?.formId || undefined;

/**
 * 회차 장소 표시. 장소는 회차마다 따로 두며 행사·사전등록 장소로 채우지 않는다.
 * 입력하지 않았거나 서버가 아직 주지 않는 회차는 추후 안내로 표시한다
 */
export const formatProgramPlace = (place: string | null | undefined) =>
  place?.trim() || '장소 추후 안내';

/** 프로그램 하나의 제출 결과. 한 프로그램의 실패가 다른 프로그램의 성공 표시를 가리지 않게 따로 둔다. */
export type ProgramApplyOutcome =
  | {
      kind: 'CONFIRMED' | 'WAITING' | 'PROCESSING';
      // 기존에 신청한 보호자를 재사용한 일괄 신청
      reusedGuardian?: boolean;
      // 현장 신청으로 접수한 결과
      onsite?: boolean;
    }
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

export const REUSED_GUARDIAN_NOTE =
  '보호자는 기존 신청이 유지되고, 추가한 학생만 위 결과로 접수되었습니다.';

const occupations = (list: ProgramOccupation[]) =>
  list
    .map((occupation) => OCCUPATION_LABEL[occupation] ?? occupation)
    .join('·');

const seats = (capacity: number, waitingCapacity: number) =>
  `정원 ${capacity.toLocaleString()}명 · ${
    waitingCapacity > 0
      ? `대기 ${waitingCapacity.toLocaleString()}명`
      : '대기 없음'
  }`;

/**
 * 프로그램 접수 상태 표시. 안내용이며 신청 가능 여부는 제출할 때 서버가 판정한다.
 * 참가자용 잔여석 API 가 없어 정원 마감은 여기서 알 수 없다
 */
export const getProgramRecruitmentLabel = (
  policy: ProgramPolicy | null | undefined,
  now: Date = new Date(),
) => {
  if (!policy) return '모집 설정 필요';
  if (policy.closed) return '운영 마감';
  if (now < new Date(policy.applicationStartedAt)) return '접수 전';
  if (now >= new Date(policy.applicationEndedAt)) return '접수 기간 종료';
  return '접수 중';
};

/**
 * 프로그램 모집 정책 안내 문구. 화면 안내용이며 자격·채널·정원·기간의 최종 판정은 신청할 때 서버가 한다.
 * 잔여석 공개 API 가 없어 남은 자리는 보여 주지 않는다.
 */
export const getProgramPolicyNotes = (
  policy: ProgramPolicy,
  /** 같은 묶음을 쓰는 다른 프로그램이 목록에 있으면 그 안내에 쓸 이름(프로그램·연수) */
  sharedGroupLabel?: string,
): string[] => {
  const notes = [
    `신청 ${formatFormPeriod(policy.applicationStartedAt)} ~ ${formatFormPeriod(policy.applicationEndedAt)}`,
    // 취소 가능 기간이 남아도 새 신청·대기 승급은 신청 마감·승급 종료를 따른다
    `취소 마감 ${formatFormPeriod(policy.cancelEndedAt)} · 대기 승급 종료 ${formatFormPeriod(policy.promotionEndedAt)}`,
  ];
  notes.push(
    `${occupations(policy.allowedOccupations)} 신청 가능 · ${seats(policy.capacity, policy.waitingCapacity)}`,
  );
  // 사전·현장 정원은 안내만 한다. 어느 정원을 쓰는지와 현장 접수 가능 여부는 서버가 판정한다
  if (policy.preRegistrationCapacity != null)
    notes.push(
      `사전 접수 정원 ${policy.preRegistrationCapacity.toLocaleString()}명`,
    );
  // 서버는 묶음을 지정하지 않은 프로그램에도 고유 묶음을 넣으므로, 묶음을 함께 쓰는 프로그램이 있을 때만 안내한다
  if (sharedGroupLabel)
    notes.push(
      `같은 묶음에 속한 ${sharedGroupLabel} 중에서는 참가자마다 하나만 확정 또는 대기로 신청할 수 있습니다.`,
    );
  if (policy.closed) notes.push('운영 측에서 신청을 마감했습니다.');
  return notes;
};

export const INELIGIBLE_REASON_LABEL: Record<ProgramIneligibleReason, string> =
  {
    OCCUPATION_NOT_ALLOWED: '이 프로그램의 신청 대상 직업이 아닙니다',
    PREREGISTRATION_NOT_CONFIRMED: '사전등록이 확정되지 않았습니다',
    GROUP_ALREADY_APPLIED: '같은 묶음에 이미 신청했습니다',
    TIME_CONFLICT: '운영 시간이 겹치는 신청이 있습니다',
  };

export const getIneligibleLabel = (reason?: string | null) =>
  INELIGIBLE_REASON_LABEL[reason as ProgramIneligibleReason] ??
  '신청할 수 없는 참가자';

/** 회차의 현재 잔여석·대기 현황(참고값). 잔여·대기 인원·남은 대기석은 서로 다른 값이다. */
export const getSeatsLabel = (c: ProgramCapacity): string =>
  `잔여 ${c.remaining.toLocaleString()}명 · 대기 ${c.waitingCount.toLocaleString()}명 (남은 대기석 ${c.waitingRemaining.toLocaleString()}명)`;
