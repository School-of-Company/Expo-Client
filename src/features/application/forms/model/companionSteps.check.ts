/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/companionSteps.check.ts`
 */
import assert from 'node:assert/strict';
import {
  buildSteps,
  findReusedGuardian,
  moveStep,
  validateSelection,
} from './companionSteps.ts';

const student = (id: number, grade?: number | null) => ({
  participantId: id,
  name: `s${id}`,
  occupation: 'ELEMENTARY_STUDENT',
  grade,
});
const guardian = (id: number, guardianApplied = false) => ({
  participantId: id,
  name: `p${id}`,
  occupation: 'PARENT',
  guardianApplied,
});

// 학생 2명 + 보호자 1명
const a = student(1, 2);
const b = student(2, 3);
const p = guardian(9);
assert.equal(validateSelection([a, b, p]), null);
assert.deepEqual(
  buildSteps([a, p, b]).map((x) => x.participantId),
  [1, 2, 9],
);

// 보호자 단독·학생 없음·보호자 둘
assert.match(validateSelection([p]) ?? '', /단독/);
assert.ok(validateSelection([]));
assert.match(validateSelection([a, p, guardian(8)]) ?? '', /한 명/);

// 1~3학년인데 보호자 없음 / 학년 범위 밖 / 학년 모름은 서버에 맡김
assert.match(validateSelection([a]) ?? '', /보호자/);
assert.equal(validateSelection([student(3, 5)]), null);
assert.equal(validateSelection([student(4)]), null);

// 기존 보호자 재사용: 폼 단계에서 제외
const reused = guardian(9, true);
assert.deepEqual(
  buildSteps([a, reused]).map((x) => x.participantId),
  [1],
);
assert.equal(findReusedGuardian([a, reused])?.participantId, 9);
assert.equal(findReusedGuardian([a, p]), undefined);

// 이동 범위
assert.equal(moveStep(0, -1, 3), 0);
assert.equal(moveStep(2, 1, 3), 2);
assert.equal(moveStep(1, 1, 3), 2);

console.log('companionSteps ok');
