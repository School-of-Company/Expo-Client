/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/useParticipantExpoDetail.check.ts`
 */
import assert from 'node:assert/strict';
import { AxiosError, AxiosHeaders } from 'axios';
import { ApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { getParticipantExpoDetail } from './useParticipantExpoDetail';

const requested: string[] = [];
let status = 200;

clientInstance.defaults.adapter = async (config) => {
  requested.push(`${config.baseURL}${config.url}`);
  const response = {
    status,
    statusText: '',
    headers: {},
    config: { ...config, headers: new AxiosHeaders() },
    data:
      status === 200
        ? {
            title: '박람회',
            description: '소개',
            location: '광주',
            startedDay: '2026-10-31',
            finishedDay: '2026-11-01',
            participantPhoneVerificationRequired: false,
            // 공개 응답에 섞여 와도 화면은 쓰지 않는다
            x: '1',
          }
        : { message: '찾을 수 없습니다.' },
  };
  if (status >= 400) {
    throw new AxiosError('fail', 'ERR_BAD_REQUEST', config, null, response);
  }
  return response;
};

const main = async () => {
  const detail = await getParticipantExpoDetail('expo 1');
  assert.deepEqual(requested, ['/api/server/expo/expo%201/public']);
  assert.deepEqual(Object.keys(detail).sort(), [
    'description',
    'finishedDay',
    'location',
    'participantPhoneVerificationRequired',
    'startedDay',
    'title',
  ]);
  assert.equal(detail.participantPhoneVerificationRequired, false);

  status = 404;
  const error = await getParticipantExpoDetail('expo-1').catch((e) => e);
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, 404);
  console.log('ok');
};

main();
