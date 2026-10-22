import assert from 'node:assert/strict';
import { test } from 'node:test';
import { programScanFailure, programScanSuccess } from './programScanResult';

test('입실 결과는 시각과 이름을 보여 준다', () => {
  const r = programScanSuccess({
    result: 'ENTERED',
    name: '홍길동',
    time: '10:05',
  });
  assert.equal(r.status, 'success');
  assert.equal(r.title, '입실 10:05');
  assert.equal(r.detail, '홍길동');
});

test('퇴실 결과는 시각과 이름을 보여 준다', () => {
  const r = programScanSuccess({
    result: 'LEFT',
    name: '홍길동',
    time: '11:20',
  });
  assert.equal(r.title, '퇴실 11:20');
});

test('이름을 읽지 못하면 이름 없이 보여 준다', () => {
  const r = programScanSuccess({
    result: 'ENTERED',
    name: null,
    time: '10:05',
  });
  assert.equal(r.detail, undefined);
});

test('UNCHANGED는 성공이 아닌 중립 결과로 보여 준다', () => {
  const r = programScanSuccess({
    result: 'UNCHANGED',
    name: '홍길동',
    time: null,
  });
  assert.equal(r.status, 'neutral');
  assert.match(r.detail ?? '', /홍길동/);
});

test('본문이 없는 예전 서버 응답은 스캔 완료로 보여 준다', () => {
  const r = programScanSuccess({});
  assert.equal(r.status, 'success');
  assert.equal(r.title, '스캔 완료');
});

test('거절되면 서버 사유를 그대로 보여 준다', () => {
  const r = programScanFailure(new Error('출석 가능한 시간이 아닙니다.'));
  assert.equal(r.status, 'error');
  assert.equal(r.detail, '출석 가능한 시간이 아닙니다.');
});
