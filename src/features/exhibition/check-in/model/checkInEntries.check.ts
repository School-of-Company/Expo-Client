/**
 * 자체 점검: `node --experimental-strip-types src/features/exhibition/check-in/model/checkInEntries.check.ts`
 */
import assert from 'node:assert/strict';
import {
  EMPTY_ENTRIES,
  entriesStorageKey,
  parseSavedEntries,
  serializeEntries,
} from './checkInEntries.ts';

const today = '2026-10-31';
const teacher = {
  id: 1,
  name: '김교사',
  phoneNumber: '010-****-5678',
  personalInformationStatus: true,
  participationType: 'STANDARD',
  badge: { school: '광주초', name: '김교사' },
} as never;

// 저장한 오늘 기록을 그대로 되살린다
const saved = serializeEntries({ entries: [teacher], paperQrCount: 3 }, today);
assert.deepEqual(parseSavedEntries(saved, today), {
  entries: [teacher],
  paperQrCount: 3,
});

// 행사일이 바뀌면 지난 기록은 버린다
assert.deepEqual(parseSavedEntries(saved, '2026-11-01'), EMPTY_ENTRIES);

// 없거나 깨진 값, 모양이 다른 값은 비운 채 시작한다
assert.deepEqual(parseSavedEntries(null, today), EMPTY_ENTRIES);
assert.deepEqual(parseSavedEntries('{not json', today), EMPTY_ENTRIES);
assert.deepEqual(
  parseSavedEntries('{"date":"2026-10-31"}', today),
  EMPTY_ENTRIES,
);
assert.deepEqual(
  parseSavedEntries(
    JSON.stringify({
      date: today,
      entries: [null, 5, { x: 1 }, teacher],
      paperQrCount: -2,
    }),
    today,
  ),
  { entries: [teacher], paperQrCount: 0 },
);

// 박람회마다 저장 위치가 다르다
assert.notEqual(entriesStorageKey('a'), entriesStorageKey('b'));

console.log('checkInEntries.check: ok');
