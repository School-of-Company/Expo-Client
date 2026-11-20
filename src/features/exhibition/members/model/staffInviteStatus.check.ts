/**
 * 자체 점검: `node --experimental-strip-types src/features/exhibition/members/model/staffInviteStatus.check.ts`
 */
import assert from 'node:assert/strict';
import { toStaffInviteStatus } from './staffInviteStatus.ts';

const now = Date.parse('2026-11-20T03:00:00Z');

// 서버는 Instant(UTC ISO)를 준다
assert.equal(
  toStaffInviteStatus(
    { expiresAt: '2026-11-20T09:00:00Z', revokedAt: null },
    now,
  ),
  'ACTIVE',
);
// 만료 시각이 지났으면(같은 순간 포함) 만료
assert.equal(
  toStaffInviteStatus(
    { expiresAt: '2026-11-20T03:00:00Z', revokedAt: null },
    now,
  ),
  'EXPIRED',
);
// 회수는 만료 전이어도, 만료 뒤여도 회수로 보인다
assert.equal(
  toStaffInviteStatus(
    { expiresAt: '2026-11-21T00:00:00Z', revokedAt: '2026-11-20T01:00:00Z' },
    now,
  ),
  'REVOKED',
);
assert.equal(
  toStaffInviteStatus(
    { expiresAt: '2026-11-19T00:00:00Z', revokedAt: '2026-11-18T00:00:00Z' },
    now,
  ),
  'REVOKED',
);

console.log('staffInviteStatus ok');
