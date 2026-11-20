/**
 * 자체 점검: `node --experimental-strip-types src/shared/config/expoRole.check.ts`
 */
import assert from 'node:assert/strict';
import {
  canDeleteExpo,
  canManageMembers,
  isMonitoringOnly,
} from './expoRole.ts';

// 운영진 관리는 OWNER 와 최고 관리자만
assert.equal(canManageMembers('OWNER'), true);
assert.equal(canManageMembers('MANAGER'), false);
assert.equal(canManageMembers('VIEWER'), false);
assert.equal(canManageMembers(null), false);
assert.equal(canManageMembers(null, true), true);
assert.equal(canManageMembers('VIEWER', true), true);

// 삭제는 OWNER 만. 역할을 모르면 숨기지 않고 서버에 맡긴다
assert.equal(canDeleteExpo('OWNER'), true);
assert.equal(canDeleteExpo('MANAGER'), false);
assert.equal(canDeleteExpo('VIEWER'), false);
assert.equal(canDeleteExpo(null), true);
assert.equal(canDeleteExpo(undefined), true);

// 모니터링만 보는 역할은 VIEWER 뿐이다
assert.equal(isMonitoringOnly('VIEWER'), true);
assert.equal(isMonitoringOnly('MANAGER'), false);
assert.equal(isMonitoringOnly(null), false);

console.log('expoRole ok');
