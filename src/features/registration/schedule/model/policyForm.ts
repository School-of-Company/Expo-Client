import {
  isProgramTitleTooLong,
  PROGRAM_TITLE_MAX_LENGTH,
} from '@/shared/config/validation';
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

/**
 * 화면에서 편집하는 모집 정책. 일시는 로컬 'YYYY-MM-DDTHH:mm' 이다.
 * capacity 는 사전·현장 정원의 합이다(withCapacityTotals)
 */
export interface PolicyForm {
  capacity: number;
  waitingCapacity: number;
  /** 사전 접수 정원. 0 이상 */
  preRegistrationCapacity: number;
  /** 현장 접수 정원. 0 이상이며 현장 개방·신청 권한을 뜻하지 않는다 */
  onsiteCapacity: number;
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
  /** 회차 장소(선택). 같은 묶음이라도 회차마다 다를 수 있다 */
  place: string;
  category: TrainingCategory;
  /** false 면 정책을 보내지 않는다. 수정에서는 기존 정책을 그대로 둔다 */
  hasPolicy: boolean;
  policy: PolicyForm;
}

export const EMPTY_POLICY_FORM: PolicyForm = {
  capacity: 1,
  waitingCapacity: 0,
  preRegistrationCapacity: 1,
  onsiteCapacity: 0,
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
  place: '',
  category: 'CHOICE',
  // 새 프로그램은 신청을 받는 것이 기본이라 폼 선택이 처음부터 보이게 한다. 정책 없는 기존 프로그램은 toProgramForm 이 그대로 둔다
  hasPolicy: true,
  policy: EMPTY_POLICY_FORM,
};

// 타입은 서버 계약대로 필수지만 런타임 값은 서버 응답이라, 빠진 값이 와도 화면이 깨지지 않게 기본값을 둔다.
// 빈 값은 저장할 때 validateProgramForm 이 다시 막는다
const toPolicyForm = (policy: ProgramPolicy): PolicyForm => ({
  capacity: policy.capacity ?? 1,
  waitingCapacity: policy.waitingCapacity ?? 0,
  // 두 정원이 없는 옛 응답은 전체 정원을 사전 접수로 본다
  preRegistrationCapacity:
    policy.preRegistrationCapacity ?? policy.capacity ?? 1,
  onsiteCapacity: policy.onsiteCapacity ?? 0,
  applicationStartedAt: fromOffsetDateTime(policy.applicationStartedAt),
  applicationEndedAt: fromOffsetDateTime(policy.applicationEndedAt),
  cancelEndedAt: fromOffsetDateTime(policy.cancelEndedAt),
  promotionEndedAt: fromOffsetDateTime(policy.promotionEndedAt),
  closed: policy.closed ?? false,
  allowedOccupations: policy.allowedOccupations ?? [],
  formId: policy.formId ?? '',
  groupId: policy.groupId ?? '',
});

/** 총정원은 사전·현장 정원의 합이다 */
export const withCapacityTotals = (policy: PolicyForm): PolicyForm => ({
  ...policy,
  capacity: policy.preRegistrationCapacity + policy.onsiteCapacity,
});

export const toProgramForm = (program: ScheduleProgram): ProgramForm => ({
  programType: program.programType,
  title: program.title,
  startedAt: program.startedAt.slice(0, 16),
  endedAt: program.endedAt.slice(0, 16),
  place: program.place ?? '',
  category: program.category ?? 'CHOICE',
  hasPolicy: program.policy !== null,
  policy: program.policy ? toPolicyForm(program.policy) : EMPTY_POLICY_FORM,
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 서버 ProgramPolicyRequest.validate() 의 정원 규칙. 총정원 = 사전 + 현장 ≥ 1, 각각 정수 0 이상 */
const getCapacityProblem = (policy: ProgramPolicy): string | null => {
  const { preRegistrationCapacity: pre, onsiteCapacity: onsite } = policy;
  if (!Number.isInteger(pre) || pre < 0)
    return '사전 접수 정원을 확인해주세요.';
  if (!Number.isInteger(onsite) || onsite < 0)
    return '현장 접수 정원을 확인해주세요.';
  if (pre + onsite !== policy.capacity || policy.capacity < 1)
    return '사전·현장 정원의 합은 1명 이상이어야 합니다.';
  return null;
};

/**
 * 서버 ProgramPolicyRequest.validate() 와 같은 규칙. 문제가 없으면 null.
 * 모집 시작 < 모집 종료, 취소 마감·대기 승급 마감 ≥ 모집 시작, 직업 1개 이상, 정원 합 일치
 */
export const getPolicyProblem = (policy: ProgramPolicy): string | null => {
  const startedAt = Date.parse(policy.applicationStartedAt);
  if (!(startedAt < Date.parse(policy.applicationEndedAt)))
    return '모집 종료가 모집 시작보다 늦어야 합니다.';
  if (Date.parse(policy.cancelEndedAt) < startedAt)
    return '취소 마감은 모집 시작 이후여야 합니다.';
  if (Date.parse(policy.promotionEndedAt) < startedAt)
    return '대기 승급 마감은 모집 시작 이후여야 합니다.';
  // 일괄 적용은 조회한 정책을 그대로 합치므로 값이 빠져 와도 TypeError 대신 사유로 막는다
  if (!policy.allowedOccupations?.length)
    return '신청 가능 직업을 하나 이상 선택해주세요.';
  return getCapacityProblem(policy);
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
  // 보낼 때 앞뒤 공백을 지우므로 지운 값으로 센다
  if (isProgramTitleTooLong(form.title.trim()))
    return `프로그램명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
  if (!form.startedAt || !form.endedAt) return '시작·종료 일시를 입력해주세요.';
  if (form.startedAt >= form.endedAt)
    return '종료 일시가 시작 일시보다 늦어야 합니다.';
  if (!form.hasPolicy) return null;

  const policy = withCapacityTotals(form.policy);
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
  if (!policy.formId.trim()) return '프로그램 폼을 선택해주세요.';
  if (!UUID_PATTERN.test(policy.formId.trim()))
    return '프로그램 폼을 다시 선택해주세요.';
  if (policy.groupId.trim() && !UUID_PATTERN.test(policy.groupId.trim()))
    return '프로그램 묶음을 다시 선택해주세요.';
  return getPolicyProblem(toProgramPolicy(policy));
};

/** validateProgramForm 을 통과한 정책만 넘긴다. 일시가 비어 있으면 throw 한다 */
export const toProgramPolicy = (form: PolicyForm): ProgramPolicy => {
  const policy = withCapacityTotals(form);
  return {
    capacity: policy.capacity,
    waitingCapacity: policy.waitingCapacity,
    preRegistrationCapacity: policy.preRegistrationCapacity,
    onsiteCapacity: policy.onsiteCapacity,
    applicationStartedAt: toPolicyDateTime(policy.applicationStartedAt),
    applicationEndedAt: toPolicyDateTime(policy.applicationEndedAt),
    cancelEndedAt: toPolicyDateTime(policy.cancelEndedAt),
    promotionEndedAt: toPolicyDateTime(policy.promotionEndedAt),
    closed: policy.closed,
    allowedOccupations: policy.allowedOccupations,
    groupId: policy.groupId.trim() || null,
    formId: policy.formId.trim(),
  };
};

export const toProgramRequest = (
  form: ProgramForm,
): ScheduleProgramRequest => ({
  title: form.title.trim(),
  startedAt: toProgramDateTime(form.startedAt ?? ''),
  endedAt: toProgramDateTime(form.endedAt ?? ''),
  // 서버는 null 이면 기존 장소를 두고 빈 문자열이면 지운다. 비운 칸은 빈 문자열로 보낸다. 장소 필드 전 초안에는 값이 없을 수 있다
  place: (form.place ?? '').trim(),
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
    // 정책만 바꿀 때 회차 장소가 지워지지 않게 그대로 돌려보낸다
    place: program.place ?? null,
    ...(program.category ? { category: program.category } : {}),
    policy,
  };
};
