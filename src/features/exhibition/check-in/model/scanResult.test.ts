import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError, AxiosHeaders } from 'axios';
import { toScanError } from '@/shared/libs/http/getScanErrorMessage';
import { reEntryResult, scanFailureResult } from './scanResult';

// 서비스는 { status, message }, Next 프록시는 { error, status } 로 오류를 준다
const axiosError = (status: number, data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });

const failure = (
  mode: 'entry' | 'exit',
  status: number,
  message: string,
  shape: 'service' | 'proxy' = 'service',
) =>
  scanFailureResult(
    mode,
    toScanError(
      axiosError(
        status,
        shape === 'service' ? { status, message } : { error: message, status },
      ),
      '실패',
    ),
  );

const ENTRY_AGAIN = /퇴장 모드에서 퇴장 처리한 뒤 다시 스캔/;
const NO_ENTRY = /아직 입장 처리되지 않았거나/;

test('입장 모드에서 이미 입장한 QR 은 퇴장 후 다시 스캔하라고 안내한다', () => {
  for (const message of [
    '이미 박람회에 입장한 유저입니다.',
    '오늘 이미 입장한 QR입니다.',
  ]) {
    for (const shape of ['service', 'proxy'] as const) {
      const result = failure('entry', 400, message, shape);
      assert.equal(result.status, 'error');
      assert.equal(result.title, '입장 실패');
      assert.equal(result.detail, message);
      assert.match(result.hint ?? '', ENTRY_AGAIN);
    }
  }
});

test('입장 모드의 다른 400 사유에는 안내를 붙이지 않는다', () => {
  for (const message of [
    '해당 박람회는 진행 중인 상태가 아닙니다.',
    '취소된 신청입니다.',
    '입장 시간이 아닙니다. 신청한 회차 시작 30분 전부터 입장할 수 있습니다.',
    '신청한 회차가 이미 끝났습니다.',
  ]) {
    assert.equal(failure('entry', 400, message).hint, undefined, message);
  }
});

test('400 이 아니거나 퇴장 모드면 이미 입장 문구여도 입장 안내를 붙이지 않는다', () => {
  assert.equal(
    failure('entry', 409, '이미 박람회에 입장한 유저입니다.').hint,
    undefined,
  );
  assert.equal(
    failure('exit', 400, '이미 박람회에 입장한 유저입니다.').hint,
    undefined,
  );
});

test('퇴장 모드에서 오늘 입장 기록이 없으면 입장 전이거나 예전 입장이라고 안내한다', () => {
  const result = failure('exit', 400, '오늘 입장 기록이 없습니다.');
  assert.equal(result.title, '퇴장 실패');
  assert.match(result.hint ?? '', NO_ENTRY);
  assert.equal(
    failure('entry', 400, '오늘 입장 기록이 없습니다.').hint,
    undefined,
  );
});

test('이미 퇴장한 QR 에는 안내를 붙이지 않는다', () => {
  assert.equal(
    failure('exit', 400, '오늘 이미 퇴장 처리된 QR입니다.').hint,
    undefined,
  );
});

test('응답이 없는 네트워크 오류는 상태가 없어 안내를 붙이지 않는다', () => {
  const error = toScanError(
    new AxiosError('Network Error', 'ERR_NETWORK'),
    '실패',
  );
  const result = scanFailureResult('entry', error);
  assert.match(result.detail ?? '', /네트워크/);
  assert.equal(result.hint, undefined);
});

test('Error 가 아닌 값이 와도 제목만 보여 준다', () => {
  const result = scanFailureResult('exit', 'boom');
  assert.equal(result.title, '퇴장 실패');
  assert.equal(result.detail, undefined);
  assert.equal(result.hint, undefined);
});

test('재입장 결과는 명찰이 처음 입장 때만 나온다고 안내한다', () => {
  const result = reEntryResult('홍길동', '2026-10-19T09:05:00');
  assert.equal(result.isReEntry, true);
  assert.equal(result.detail, '홍길동 · 최초 입장 09:05');
  assert.equal(result.hint, '명찰은 처음 입장할 때만 출력됩니다.');
});
