/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/handler/scannerName.check.ts`
 */
import assert from 'node:assert/strict';
import { scannerNameHeaders } from './scannerName.ts';

const forwarded = { 'X-Scanner-Name': '정문-1' };

// 입장·퇴장·종이 QR 입장·간편입장은 넘긴다
assert.deepEqual(
  scannerNameHeaders('PATCH', '/attendance/e1', '정문-1'),
  forwarded,
);
assert.deepEqual(
  scannerNameHeaders('PATCH', '/attendance/exit/e1', '정문-1'),
  forwarded,
);
assert.deepEqual(
  scannerNameHeaders('PATCH', '/attendance/qr/e1', '정문-1'),
  forwarded,
);
assert.deepEqual(
  scannerNameHeaders('POST', '/walk-in-counts/e1', '정문-1'),
  forwarded,
);

// 이름이 없으면 기존처럼 헤더 없이 보낸다
assert.deepEqual(scannerNameHeaders('PATCH', '/attendance/e1', null), {});
assert.deepEqual(scannerNameHeaders('PATCH', '/attendance/e1', ''), {});

// 스캔이 아닌 요청에는 넘기지 않는다
assert.deepEqual(scannerNameHeaders('GET', '/walk-in-counts/e1', '정문-1'), {});
assert.deepEqual(
  scannerNameHeaders('GET', '/attendance/summary/e1', '정문-1'),
  {},
);
assert.deepEqual(
  scannerNameHeaders('PATCH', '/attendance/standard/p1', '정문-1'),
  {},
);
assert.deepEqual(
  scannerNameHeaders('PATCH', '/attendance/training/p1', '정문-1'),
  {},
);
assert.deepEqual(scannerNameHeaders('PATCH', '/expo/e1', '정문-1'), {});

console.log('scannerName ok');
