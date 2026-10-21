/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/common/model/ledger.check.ts`
 */
import assert from 'node:assert/strict';
import { findWaitingPosition } from './ledger';

const waitlist = (total: number) =>
  Array.from({ length: total }, (_, i) => ({ applicationId: `a${i + 1}` }));

const pager = (items: { applicationId: string }[]) => {
  const pages: number[] = [];
  const fetchPage = async (page: number) => {
    pages.push(page);
    return {
      items: items.slice(page * 100, page * 100 + 100),
      totalElements: items.length,
    };
  };
  return { fetchPage, pages };
};

(async () => {
  // 대기 150건 중 120번째: 두 번째 페이지에서 찾는다
  const big = pager(waitlist(150));
  assert.deepEqual(await findWaitingPosition(big.fetchPage, 'a120'), {
    position: 120,
    total: 150,
  });
  assert.deepEqual(big.pages, [0, 1]);

  // 첫 페이지에 있으면 더 받지 않는다
  const first = pager(waitlist(150));
  assert.deepEqual(await findWaitingPosition(first.fetchPage, 'a3'), {
    position: 3,
    total: 150,
  });
  assert.deepEqual(first.pages, [0]);

  // 끝까지 없으면 null(그 사이 확정·취소)
  const missing = pager(waitlist(250));
  assert.deepEqual(await findWaitingPosition(missing.fetchPage, 'x'), {
    position: null,
    total: 250,
  });
  assert.deepEqual(missing.pages, [0, 1, 2]);

  // 상한 페이지까지만 받는다
  const capped = pager(waitlist(500));
  assert.deepEqual(await findWaitingPosition(capped.fetchPage, 'a450', 3), {
    position: null,
    total: 500,
  });
  assert.deepEqual(capped.pages, [0, 1, 2]);

  // 대기가 없으면
  const empty = pager([]);
  assert.deepEqual(await findWaitingPosition(empty.fetchPage, 'a1'), {
    position: null,
    total: 0,
  });

  console.log('ledger.check: ok');
})();
