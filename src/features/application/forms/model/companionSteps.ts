export interface CompanionCandidate {
  participantId: number;
  name: string;
  occupation: string | null;
  // 서버가 내려 주는 학년. 없으면 클라이언트가 학년을 추측하지 않고 서버 판정에 맡긴다
  grade?: number | null;
  // 이 회차에 이미 다른 학생과 신청한 보호자. 폼·좌석을 다시 만들지 않고 재사용한다
  guardianApplied?: boolean;
}

export const isGuardian = (p: Pick<CompanionCandidate, 'occupation'>) =>
  p.occupation === 'PARENT';

/** 서버가 준 학년이 초등 1~3학년일 때만 보호자가 필요하다고 안내한다 */
export const needsGuardian = (p: CompanionCandidate) =>
  p.occupation === 'ELEMENTARY_STUDENT' &&
  typeof p.grade === 'number' &&
  p.grade >= 1 &&
  p.grade <= 3;

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
  if (guardians.length === 0 && students.some(needsGuardian))
    return '초등 1~3학년 학생은 보호자와 함께 신청해야 합니다. 보호자를 선택해주세요.';
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
