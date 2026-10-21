import type { ProgramGuardianPolicy } from '@/shared/types/program/list/type';

export interface CompanionCandidate {
  participantId: number;
  name: string;
  occupation: string | null;
  // 이 회차에 이미 신청한 보호자(GROUP_ALREADY_APPLIED). 폼·좌석을 다시 만들지 않고 재사용한다
  guardianApplied?: boolean;
}

export const isGuardian = (p: Pick<CompanionCandidate, 'occupation'>) =>
  p.occupation === 'PARENT';

const OTHER_ROLE_LABEL: Record<string, string> = {
  TEACHER: '교사',
  PRE_SERVICE_TEACHER: '예비교사',
  SCHOOL_STAFF: '교직원',
  GENERAL: '일반',
};

/** 학생이나 보호자가 될 수 없는 직업(교사·예비교사·교직원·일반). 직업을 모르면 예전처럼 학생으로 본다 */
export const isOtherRole = (p: Pick<CompanionCandidate, 'occupation'>) =>
  !!p.occupation && p.occupation in OTHER_ROLE_LABEL;

/** 선택 목록에 붙이는 역할 표시 */
export const getRoleLabel = (p: Pick<CompanionCandidate, 'occupation'>) =>
  isGuardian(p)
    ? '보호자'
    : p.occupation
      ? (OTHER_ROLE_LABEL[p.occupation] ?? '학생')
      : '학생';

/**
 * 학생 본인이 입력한 학교급·학년 답변이 초등 1~3학년인지. 문항 ID·선택지 키는 정책이 정하며
 * 라벨로 추측하지 않는다. 안내용이며 최종 판정은 서버가 한다
 */
export const isLowGrade = (
  policy: ProgramGuardianPolicy,
  answers: Record<string, unknown>,
) => {
  if (
    answers[String(policy.schoolTypeQuestionId)] !==
    policy.elementarySchoolValue
  )
    return false;
  const grade = answers[String(policy.gradeQuestionId)];
  const value =
    typeof grade === 'string' ? policy.gradeValues[grade] : undefined;
  return value !== undefined && value >= 1 && value <= 3;
};

/** 선택이 올바르지 않으면 사유를, 올바르면 null 을 돌려 준다. 최종 판정은 서버가 한다 */
export const validateSelection = (
  selected: CompanionCandidate[],
): string | null => {
  const guardians = selected.filter(isGuardian);
  const students = selected.filter((p) => !isGuardian(p));
  if (students.length === 0)
    return guardians.length > 0
      ? '보호자만 단독으로 신청할 수 없습니다. 학생을 함께 선택해주세요.'
      : '신청할 학생을 선택해주세요.';
  if (guardians.length > 1) return '보호자는 한 명만 선택할 수 있습니다.';
  if (guardians.length === 0 && students.length > 1)
    return '학생 여러 명은 보호자와 함께 신청해야 합니다. 보호자를 선택해주세요.';
  return null;
};

/** 폼을 작성할 순서: 선택한 학생 순서대로, 마지막에 보호자. 재사용하는 보호자는 폼을 다시 받지 않는다 */
export const buildSteps = (
  selected: CompanionCandidate[],
): CompanionCandidate[] => [
  ...selected.filter((p) => !isGuardian(p)),
  ...selected.filter((p) => isGuardian(p) && !p.guardianApplied),
];

/** 선택 안에서 기존 신청을 재사용하는 보호자 */
export const findReusedGuardian = (selected: CompanionCandidate[]) =>
  selected.find((p) => isGuardian(p) && p.guardianApplied);

/** 단계 이동. 범위를 벗어나지 않는다 */
export const moveStep = (current: number, delta: 1 | -1, total: number) =>
  Math.min(Math.max(current + delta, 0), Math.max(total - 1, 0));

/**
 * 일괄 신청 본문. 새로 폼을 받은 사람은 formVersion·answers 를 싣고, 재사용 보호자는 참가자 ID 만 싣는다.
 * 모든 학생을 보호자에게 연결한다
 */
export const buildBatchRequest = (
  selected: CompanionCandidate[],
  formVersion: number,
  answersById: Record<number, unknown>,
) => {
  const guardian = selected.find(isGuardian);
  if (!guardian) throw new Error('보호자가 필요합니다.');
  return {
    participants: [
      ...buildSteps(selected).map(({ participantId }) => ({
        participantId,
        formVersion,
        answers: answersById[participantId],
      })),
      ...(guardian.guardianApplied
        ? [{ participantId: guardian.participantId }]
        : []),
    ],
    links: selected
      .filter((p) => !isGuardian(p))
      .map(({ participantId }) => ({
        studentId: participantId,
        guardianId: guardian.participantId,
      })),
  };
};
