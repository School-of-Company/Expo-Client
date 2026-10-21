/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/applications/model/groupMessage.check.ts`
 */
import assert from 'node:assert/strict';
import { getPreviewStatus } from './groupMessage';
import type { GroupMessageSource } from '../../common/api/groupMessageApi';

const sms = (body: string): GroupMessageSource => ({
  scope: { kind: 'SELECTED', applicationIds: ['1'] },
  channel: 'SMS',
  body,
  fallbackToSms: false,
});
const preview = {
  source: sms('a'),
  result: { expiresAt: '2026-10-21T09:15:59Z' },
};
const before = Date.parse('2026-10-21T09:15:58Z');
const at = Date.parse('2026-10-21T09:15:59Z');

assert.equal(getPreviewStatus(preview, sms('a'), before), 'CURRENT');
assert.equal(getPreviewStatus(preview, sms('a'), at), 'EXPIRED');
assert.equal(getPreviewStatus(preview, sms('b'), before), 'CHANGED');
// 둘 다 해당하면 바뀐 쪽이 먼저
assert.equal(getPreviewStatus(preview, sms('b'), at), 'CHANGED');
console.log('groupMessage.check ok');
