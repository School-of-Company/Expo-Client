/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/common/model/preregisterSessionSchedule.check.ts`
 * 브라우저 시간대와 상관없이 같아야 하므로 `TZ=Asia/Seoul`, `TZ=America/Los_Angeles` 둘 다 돌린다
 */
import assert from 'node:assert/strict';
import { toKstLocal } from '@/shared/libs/kstDateTime';
import { formatDefinitionSchedule } from './ledger';

// 관리자 사전등록 세션 API 의 UTC 오프셋 ISO 는 한국 시각으로 바꿔서 넘긴다
assert.equal(
  formatDefinitionSchedule(
    toKstLocal('2026-10-30T00:30:00.000Z'),
    toKstLocal('2026-10-31T03:30:00.000Z'),
  ),
  '10.30(금) 09:30 ~ 10.31(토) 12:30',
);
// 날짜 필터용 앞 10자리도 한국 날짜다 (UTC 로는 전날)
assert.equal(toKstLocal('2026-10-30T16:00:00.000Z').slice(0, 10), '2026-10-31');
