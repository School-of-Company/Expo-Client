/**
 * 자체 점검: `npx jiti src/features/exhibition/participants/lib/clampPage.check.ts`
 */
import assert from 'node:assert/strict';
import { clampPage } from './clampPage';

assert.equal(clampPage(3, 1), 1);
assert.equal(clampPage(3, 5), 3);
assert.equal(clampPage(5, 5), 5);
assert.equal(clampPage(2, 0), 1);

console.log('clampPage.check OK');
