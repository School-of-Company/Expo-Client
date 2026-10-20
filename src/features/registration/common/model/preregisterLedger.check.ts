/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/common/model/preregisterLedger.check.ts`
 */
import assert from 'node:assert/strict';
import { toAnswerDisplay } from '@/entities/form/lib/answerDisplay';
import { parseInformationJson } from './preregisterLedger';

// 서버가 내려주는 JSON 문자열
assert.deepEqual(parseInformationJson('{"학교":"광주중","1":"GENERAL"}'), {
  학교: '광주중',
  1: 'GENERAL',
});
assert.deepEqual(parseInformationJson({ 학교: '광주중' }), { 학교: '광주중' });
assert.equal(parseInformationJson(null), null);
assert.equal(parseInformationJson(undefined), null);
assert.equal(parseInformationJson('  '), null);
// 객체가 아니면 원문을 남긴다
assert.deepEqual(parseInformationJson('{깨진'), { 원문: '{깨진' });
assert.deepEqual(parseInformationJson('[1]'), { 원문: '[1]' });

// 답변 렌더러에서 비어 보이지 않는다
const rows = toAnswerDisplay(
  [{ id: '1', title: '학교', formType: 'SENTENCE' }],
  parseInformationJson('{"1":"광주중"}'),
).rows;
assert.deepEqual(
  rows.map(({ label, text }) => [label, text]),
  [['학교', '광주중']],
);

console.log('preregisterLedger.check: ok');
