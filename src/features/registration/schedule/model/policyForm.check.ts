/**
 * 자체 점검. policyForm 이 CSS 를 import 하는 모듈을 끌어와 Node 가 .css 를 못 읽으므로 빈 모듈로 받는 훅을 먼저 건다(Node 22.15+).
 *   echo "import { registerHooks } from 'node:module'; registerHooks({ load: (u, c, n) => u.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : n(u, c) });" > /tmp/css.mjs
 *   : > /tmp/empty.js
 *   JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\",\"react-datepicker/dist/react-datepicker.css\":\"/tmp/empty.js\"}" NODE_OPTIONS="--import /tmp/css.mjs" npx jiti src/features/registration/schedule/model/policyForm.check.ts
 */
import assert from 'node:assert/strict';
import {
  EMPTY_POLICY_FORM,
  PolicyForm,
  ProgramForm,
  EMPTY_PROGRAM_FORM,
  toProgramPolicy,
  validateProgramForm,
  withPolicyPatch,
} from './policyForm';
import type { ScheduleProgram } from '../../common';

const policy = (patch: Partial<PolicyForm>): PolicyForm => ({
  ...EMPTY_POLICY_FORM,
  capacity: 10,
  preRegistrationCapacity: 10,
  waitingCapacity: 5,
  applicationStartedAt: '2026-10-01T09:00',
  applicationEndedAt: '2026-10-20T09:00',
  cancelEndedAt: '2026-10-25T09:00',
  promotionEndedAt: '2026-10-30T00:00',
  allowedOccupations: ['STUDENT'] as never,
  formId: '01a1595c-8dd7-7998-86b0-f9af65ce3e2a',
  autoPromotionEndedAt: '2026-10-28T00:00',
  ...patch,
});
const program = (p: PolicyForm): ProgramForm => ({
  ...EMPTY_PROGRAM_FORM,
  title: '회차',
  startedAt: '2026-11-01T10:00',
  endedAt: '2026-11-01T11:00',
  hasPolicy: true,
  policy: p,
});

// OFF 라도 state 의 종료 시각이 있으면 검증을 통과하고, 요청에는 키가 없다
const off = program(policy({ autoPromotionEnabled: false }));
assert.equal(validateProgramForm(off), null);
assert.equal('autoPromotionEndedAt' in toProgramPolicy(off.policy), false);

// ON 으로 되돌리면 같은 종료 시각이 그대로 나간다
const on = program(policy({ autoPromotionEnabled: true }));
assert.equal(validateProgramForm(on), null);
assert.ok(toProgramPolicy(on.policy).autoPromotionEndedAt);

// 일괄 적용: OFF 패치면 기존 종료 시각이 요청에서 빠진다
const base = toProgramPolicy(on.policy);
const patched = withPolicyPatch(
  {
    title: 't',
    startedAt: '2026-11-01T10:00',
    endedAt: '2026-11-01T11:00',
    policy: base,
  } as unknown as ScheduleProgram,
  { autoPromotionEnabled: false },
);
assert.equal(patched.policy?.autoPromotionEnabled, false);
assert.equal('autoPromotionEndedAt' in (patched.policy ?? {}), false);

// 현장 접수 기간: 한쪽만 입력하면 막고, 둘 다 있거나 둘 다 없으면 통과한다
const START = '2026-11-01T09:00';
const END = '2026-11-01T18:00';
const PAIR_MESSAGE = '현장 접수 시작·종료를 함께 설정해주세요.';
const onsite = (a: string | null, b: string | null) =>
  validateProgramForm(
    program(policy({ onsiteStartedAt: a, onsiteEndedAt: b })),
  );
assert.equal(onsite(START, null), PAIR_MESSAGE);
assert.equal(onsite(null, END), PAIR_MESSAGE);
assert.equal(onsite(START, END), null);
assert.equal(onsite(null, null), null);
assert.notEqual(onsite(END, START), null);

console.log('policyForm.check OK');
