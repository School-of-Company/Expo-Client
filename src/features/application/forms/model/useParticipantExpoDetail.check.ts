/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/useParticipantExpoDetail.check.ts`
 */
import assert from 'node:assert/strict';
import { AxiosError, AxiosHeaders } from 'axios';
import { ApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getParticipantExpoDetail } from './useParticipantExpoDetail';

const location = { href: '/application/forms/expo-1' };
Object.assign(globalThis, { window: { location } });

// 토큰 없는 참가자: 프록시가 갱신 실패 401 을 준다
clientTokenInstance.defaults.adapter = async (config) => {
  throw new AxiosError('401', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    statusText: 'Unauthorized',
    data: { isRefreshError: true },
    headers: {},
    config: { ...config, headers: new AxiosHeaders() },
  });
};

// /signin 으로 보내면 끝나지 않는 Promise 라 여기까지 오지 못한다. 그때 실패로 끝나게 한다
process.exitCode = 1;

const main = async () => {
  const error = await getParticipantExpoDetail('expo-1').catch((e) => e);
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, 401);
  assert.equal(location.href, '/application/forms/expo-1');
  process.exitCode = 0;
  console.log('ok');
};

main();
