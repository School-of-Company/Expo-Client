/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/companionSteps.check.ts`
 */
import assert from 'node:assert/strict';
import {
  buildBatchRequest,
  buildSteps,
  findProblemParticipants,
  findReusedGuardian,
  getRoleLabel,
  isOtherRole,
  isLowGrade,
  moveStep,
  validateSelection,
  withProblemParticipants,
} from './companionSteps.ts';

const student = (id: number) => ({
  participantId: id,
  name: `s${id}`,
  occupation: 'ELEMENTARY_STUDENT',
});
const guardian = (id: number, guardianApplied = false) => ({
  participantId: id,
  name: `p${id}`,
  occupation: 'PARENT',
  guardianApplied,
});

// 학생 2명 + 보호자 1명
const a = student(1);
const b = student(2);
const p = guardian(9);
assert.equal(validateSelection([a, b, p]), null);
assert.deepEqual(
  buildSteps([a, p, b]).map((x) => x.participantId),
  [1, 2, 9],
);

// 보호자 단독·학생 없음·보호자 둘·학생 여러 명 보호자 없음
assert.match(validateSelection([p]) ?? '', /단독/);
assert.ok(validateSelection([]));
assert.match(validateSelection([a, p, guardian(8)]) ?? '', /한 명/);
assert.match(validateSelection([a, b]) ?? '', /보호자/);
// 학생 한 명만 고르는 것은 선택 단계에서 막지 않는다(학년은 제출 직전 답변으로 확인)
assert.equal(validateSelection([a]), null);

// 학년 판정은 정책의 문항 ID·선택지 키로만 한다
const policy = {
  formVersion: 1,
  schoolTypeQuestionId: 101,
  elementarySchoolValue: 'ELEM',
  gradeQuestionId: 102,
  gradeValues: { g1: 1, g2: 2, g3: 3, g4: 4, g5: 5, g6: 6 },
};
assert.equal(isLowGrade(policy, { '101': 'ELEM', '102': 'g3' }), true);
assert.equal(isLowGrade(policy, { '101': 'ELEM', '102': 'g4' }), false);
assert.equal(isLowGrade(policy, { '101': 'MIDDLE', '102': 'g1' }), false);
assert.equal(isLowGrade(policy, { '101': 'ELEM' }), false);

// 기존 보호자 재사용: 폼 단계에서 제외하고 본문에는 참가자 ID 만 싣는다
const reused = guardian(9, true);
assert.deepEqual(
  buildSteps([a, reused]).map((x) => x.participantId),
  [1],
);
assert.equal(findReusedGuardian([a, reused])?.participantId, 9);
assert.equal(findReusedGuardian([a, p]), undefined);
assert.deepEqual(buildBatchRequest([a, reused], 3, { 1: { '5': 'x' } }), {
  participants: [
    { participantId: 1, formVersion: 3, answers: { '5': 'x' } },
    { participantId: 9 },
  ],
  links: [{ studentId: 1, guardianId: 9 }],
});

// 신규 보호자: 학생 순서 → 보호자, 모든 학생이 보호자에 연결
const batch = buildBatchRequest([a, b, p], 3, { 1: {}, 2: {}, 9: {} });
assert.deepEqual(
  batch.participants.map((x) => x.participantId),
  [1, 2, 9],
);
assert.deepEqual(batch.links, [
  { studentId: 1, guardianId: 9 },
  { studentId: 2, guardianId: 9 },
]);

// 이동 범위
assert.equal(moveStep(0, -1, 3), 0);
assert.equal(moveStep(2, 1, 3), 2);
assert.equal(moveStep(1, 1, 3), 2);

// 역할 표시: 교사·예비교사·일반은 학생으로 보이지 않고 선택할 수 없다
const other = (occupation: string | null) => ({ occupation });
assert.equal(getRoleLabel(other('TEACHER')), '교사');
assert.equal(getRoleLabel(other('PRE_SERVICE_TEACHER')), '예비교사');
assert.equal(getRoleLabel(other('GENERAL')), '일반');
assert.equal(getRoleLabel(other('PARENT')), '보호자');
assert.equal(getRoleLabel(other('MIDDLE_SCHOOL_STUDENT')), '학생');
assert.equal(getRoleLabel(other(null)), '학생');
assert.equal(isOtherRole(other('TEACHER')), true);
assert.equal(isOtherRole(other('ELEMENTARY_STUDENT')), false);
assert.equal(isOtherRole(other(null)), false);

console.log('companionSteps ok');

// 거절 사유로 고쳐야 할 신청서를 가려 낸다
const guarded = { ...policy, guardianSchoolValue: 'PARENT_KEY' };
const answers = {
  1: { '101': 'ELEM', '102': 'g2' },
  2: { '101': 'ELEM', '102': 'zz' },
  9: { '101': 'ELEM' },
};
assert.deepEqual(
  findProblemParticipants('GUARDIAN_REQUIRED', guarded, [a, b, p], answers).map(
    (x) => x.participantId,
  ),
  [1],
);
assert.deepEqual(
  findProblemParticipants('GRADE_INVALID', guarded, [a, b, p], answers).map(
    (x) => x.participantId,
  ),
  [2],
);
assert.deepEqual(
  findProblemParticipants(
    'SCHOOL_TYPE_MISMATCH',
    guarded,
    [a, b, p],
    answers,
  ).map((x) => x.participantId),
  [9],
);
assert.deepEqual(
  findProblemParticipants(
    'COMPANION_LIMIT_REACHED',
    guarded,
    [a, b, p],
    answers,
  ),
  [],
);
assert.deepEqual(
  findProblemParticipants('GRADE_INVALID', null, [a], answers),
  [],
);
assert.equal(
  withProblemParticipants('학년을 확인해 주세요.', [b]),
  '학년을 확인해 주세요. 확인할 신청서: s2(학생)',
);
assert.equal(withProblemParticipants('x', []), 'x');
