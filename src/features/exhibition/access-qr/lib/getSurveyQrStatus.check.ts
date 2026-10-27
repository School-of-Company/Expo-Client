/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/exhibition/access-qr/lib/getSurveyQrStatus.check.ts`
 */
import assert from 'node:assert/strict';
import { ApiError } from '@/shared/libs/http/apiError';
import { getSurveyQrStatus } from './getSurveyQrStatus';

assert.equal(getSurveyQrStatus({ isPending: true, error: null }), 'loading');
assert.equal(getSurveyQrStatus({ isPending: false, error: null }), 'ready');
assert.equal(
  getSurveyQrStatus({ isPending: false, error: new ApiError('없음', 404) }),
  'none',
);
assert.equal(
  getSurveyQrStatus({ isPending: false, error: new ApiError('서버', 500) }),
  'error',
);
assert.equal(
  getSurveyQrStatus({ isPending: false, error: new Error('network') }),
  'error',
);
console.log('getSurveyQrStatus.check ok');
