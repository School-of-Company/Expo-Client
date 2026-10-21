/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/surveyTab.check.ts`
 */
import assert from 'node:assert/strict';
import { getSurveyWindow, isSurveyTabPeriod } from './surveyTab';

const at = (iso: string) => new Date(iso).getTime();

// 다일 행사: 10/26 ~ 10/28
const START = '2026-10-26T09:00:00';
const END = '2026-10-28T17:00:00';

assert.equal(
  isSurveyTabPeriod(START, END, at('2026-10-25T23:59:59+09:00')),
  false,
);
assert.equal(
  isSurveyTabPeriod(START, END, at('2026-10-26T00:00:00+09:00')),
  true,
);
assert.equal(
  isSurveyTabPeriod(START, END, at('2026-10-27T12:00:00+09:00')),
  true,
);
assert.equal(
  isSurveyTabPeriod(START, END, at('2026-10-28T23:59:59+09:00')),
  true,
);
assert.equal(
  isSurveyTabPeriod(START, END, at('2026-10-29T00:00:00+09:00')),
  false,
);
// 서버가 UTC 로 내려줘도 KST 날짜로 센다(10/25 15:00Z = 10/26 00:00 KST)
assert.equal(isSurveyTabPeriod(START, END, at('2026-10-25T15:00:00Z')), true);
// 당일 행사
assert.equal(
  isSurveyTabPeriod(START, START, at('2026-10-26T23:59:59+09:00')),
  true,
);
assert.equal(
  isSurveyTabPeriod(START, START, at('2026-10-27T00:00:00+09:00')),
  false,
);
assert.equal(
  getSurveyWindow(START, START).closeAt - getSurveyWindow(START, START).openAt,
  24 * 60 * 60 * 1000,
);
console.log('surveyTab ok');
