import {
  fromOffsetDateTime,
  ProgramPolicy,
  ScheduleProgram,
  ScheduleProgramRequest,
  toOffsetDateTime,
  toProgramDateTime,
  TrainingCategory,
} from '../../common';
import {
  AdminOccupation,
  ProgramSessionType,
} from '../../common/api/ledgerApi';

/** 화면에서 편집하는 모집 정책. 일시는 로컬 'YYYY-MM-DDTHH:mm' 이다 */
export interface PolicyForm {
  capacity: number;
  waitingCapacity: number;
  applicationStartedAt: string | null;
  applicationEndedAt: string | null;
  cancelEndedAt: string | null;
  promotionEndedAt: string | null;
  closed: boolean;
  allowedOccupations: AdminOccupation[];
  formId: string;
  groupId: string;
}

export interface ProgramForm {
  programType: ProgramSessionType;
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  category: TrainingCategory;
  /** false 면 정책을 보내지 않는다. 수정에서는 기존 정책을 그대로 둔다 */
  hasPolicy: boolean;
  policy: PolicyForm;
}

export const EMPTY_POLICY_FORM: PolicyForm = {
  capacity: 1,
  waitingCapacity: 0,
  applicationStartedAt: null,
  applicationEndedAt: null,
  cancelEndedAt: null,
  promotionEndedAt: null,
  closed: false,
  allowedOccupations: [],
  formId: '',
  groupId: '',
};

export const EMPTY_PROGRAM_FORM: ProgramForm = {
  programType: 'TRAINING',
  title: '',
  startedAt: null,
  endedAt: null,
  category: 'CHOICE',
  hasPolicy: false,
  policy: EMPTY_POLICY_FORM,
};

const toPolicyForm = (policy: ProgramPolicy): PolicyForm => ({
  capacity: policy.capacity,
  waitingCapacity: policy.waitingCapacity,
  applicationStartedAt: fromOffsetDateTime(policy.applicationStartedAt),
  applicationEndedAt: fromOffsetDateTime(policy.applicationEndedAt),
  cancelEndedAt: fromOffsetDateTime(policy.cancelEndedAt),
  promotionEndedAt: fromOffsetDateTime(policy.promotionEndedAt),
  closed: policy.closed,
  allowedOccupations: policy.allowedOccupations,
  formId: policy.formId,
  groupId: policy.groupId ?? '',
});

export const toProgramForm = (program: ScheduleProgram): ProgramForm => ({
  programType: program.programType,
  title: program.title,
  startedAt: program.startedAt.slice(0, 16),
  endedAt: program.endedAt.slice(0, 16),
  category: program.category ?? 'CHOICE',
  hasPolicy: program.policy !== null,
  policy: program.policy ? toPolicyForm(program.policy) : EMPTY_POLICY_FORM,
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 서버 ProgramPolicyRequest.validate() 와 같은 규칙. 문제가 없으면 null.
 * 모집 시작 < 모집 종료, 취소 마감·대기 승급 마감 ≥ 모집 시작, 직업 1개 이상
 */
export const getPolicyProblem = (policy: ProgramPolicy): string | null => {
  const startedAt = Date.parse(policy.applicationStartedAt);
  if (!(startedAt < Date.parse(policy.applicationEndedAt)))
    return '모집 종료가 모집 시작보다 늦어야 합니다.';
  if (Date.parse(policy.cancelEndedAt) < startedAt)
    return '취소 마감은 모집 시작 이후여야 합니다.';
  if (Date.parse(policy.promotionEndedAt) < startedAt)
    return '대기 승급 마감은 모집 시작 이후여야 합니다.';
  if (policy.allowedOccupations.length === 0)
    return '신청 가능 직업을 하나 이상 선택해주세요.';
  return null;
};

// 'YYYY-MM-DDTHH:mm'(로컬) → UTC 오프셋 ISO 8601. 정책 일시는 서버 필수값이라 비어 있으면 보내기 전에 막는다
export const toPolicyDateTime = (value: string | null): string => {
  const offset = toOffsetDateTime(value);
  if (!offset) throw new Error('모집 일시를 모두 입력해주세요.');
  return offset;
};

/** 보내기 전에 서버가 400 으로 거절할 값을 막는다. 문제가 없으면 null */
export const validateProgramForm = (form: ProgramForm): string | null => {
  if (!form.title.trim()) return '프로그램명을 입력해주세요.';
  if (!form.startedAt || !form.endedAt) return '시작·종료 일시를 입력해주세요.';
  if (form.startedAt >= form.endedAt)
    return '종료 일시가 시작 일시보다 늦어야 합니다.';
  if (!form.hasPolicy) return null;

  const { policy } = form;
  if (!Number.isInteger(policy.capacity) || policy.capacity < 1)
    return '정원은 1명 이상이어야 합니다.';
  if (!Number.isInteger(policy.waitingCapacity) || policy.waitingCapacity < 0)
    return '대기 정원을 확인해주세요.';
  // 정책의 일시 4개와 폼 ID 는 서버 필수값이다(null·누락이면 400)
  if (
    !policy.applicationStartedAt ||
    !policy.applicationEndedAt ||
    !policy.cancelEndedAt ||
    !policy.promotionEndedAt
  )
    return '모집 시작·종료, 취소 마감, 대기 승급 마감을 모두 입력해주세요.';
  if (!policy.formId.trim()) return '프로그램 폼 ID를 입력해주세요.';
  if (!UUID_PATTERN.test(policy.formId.trim()))
    return '폼 ID 형식이 올바르지 않습니다.';
  if (policy.groupId.trim() && !UUID_PATTERN.test(policy.groupId.trim()))
    return '묶음 ID 형식이 올바르지 않습니다.';
  return getPolicyProblem(toProgramPolicy(policy));
};

/** validateProgramForm 을 통과한 정책만 넘긴다. 일시가 비어 있으면 throw 한다 */
export const toProgramPolicy = (policy: PolicyForm): ProgramPolicy => ({
  capacity: policy.capacity,
  waitingCapacity: policy.waitingCapacity,
  applicationStartedAt: toPolicyDateTime(policy.applicationStartedAt),
  applicationEndedAt: toPolicyDateTime(policy.applicationEndedAt),
  cancelEndedAt: toPolicyDateTime(policy.cancelEndedAt),
  promotionEndedAt: toPolicyDateTime(policy.promotionEndedAt),
  closed: policy.closed,
  allowedOccupations: policy.allowedOccupations,
  groupId: policy.groupId.trim() || null,
  formId: policy.formId.trim(),
});

export const toProgramRequest = (
  form: ProgramForm,
): ScheduleProgramRequest => ({
  title: form.title.trim(),
  startedAt: toProgramDateTime(form.startedAt ?? ''),
  endedAt: toProgramDateTime(form.endedAt ?? ''),
  ...(form.programType === 'TRAINING' ? { category: form.category } : {}),
  policy: form.hasPolicy ? toProgramPolicy(form.policy) : null,
});

/**
 * 기존 프로그램의 기본 정보는 그대로 두고 정책 일부만 바꾼 수정 본문.
 * 정책이 없는 프로그램이거나 바꾼 결과가 서버 규칙에 어긋나면 그 사유를 담아 throw 한다
 */
export const withPolicyPatch = (
  program: ScheduleProgram,
  patch: Partial<ProgramPolicy>,
): ScheduleProgramRequest => {
  if (!program.policy) throw new Error('모집 정책이 없는 프로그램입니다.');
  const policy: ProgramPolicy = { ...program.policy, ...patch };
  const problem = getPolicyProblem(policy);
  if (problem) throw new Error(problem);

  return {
    title: program.title,
    startedAt: toProgramDateTime(program.startedAt),
    endedAt: toProgramDateTime(program.endedAt),
    ...(program.category ? { category: program.category } : {}),
    policy,
  };
};
