/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/http/retryUpstream.check.ts`
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import axios from 'axios';
import { retryOnNetworkError, shouldRetry } from './retryUpstream.ts';

const TIMEOUT = 5_000;
const networkError = (
  code: string,
  config: Record<string, unknown> = {},
  response?: unknown,
) =>
  Object.assign(new axios.AxiosError('x', code), {
    config: { method: 'get', timeout: TIMEOUT, ...config },
    response,
  });

// 응답 없는 네트워크 오류 + GET + 기본 timeout 만 다시 보낸다
for (const code of ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET'])
  assert.equal(shouldRetry(networkError(code), TIMEOUT), true);
assert.equal(shouldRetry(networkError('ENOTFOUND'), TIMEOUT), false);
// 서버가 응답한 4xx·5xx 는 다시 보내지 않는다
assert.equal(
  shouldRetry(networkError('ECONNABORTED', {}, { status: 504 }), TIMEOUT),
  false,
);
// GET 이외, 파일 다운로드(timeout 60초), 이미 한 번 다시 보낸 요청은 제외한다
assert.equal(
  shouldRetry(networkError('ECONNRESET', { method: 'post' }), TIMEOUT),
  false,
);
assert.equal(
  shouldRetry(networkError('ECONNRESET', { timeout: 60_000 }), TIMEOUT),
  false,
);
assert.equal(
  shouldRetry(networkError('ECONNRESET', { __retried: true }), TIMEOUT),
  false,
);
assert.equal(shouldRetry(new Error('x'), TIMEOUT), false);

async function main() {
  // 실제 연결: 첫 요청은 소켓을 끊고 두 번째에 응답하는 서버
  let hits = 0;
  const server = http.createServer((req, res) => {
    hits += 1;
    if (req.url === '/flaky' && hits === 1) return req.socket.destroy();
    if (req.url === '/dead') return req.socket.destroy();
    res.end('{"ok":true}');
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };
  const instance = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
    timeout: TIMEOUT,
  });
  retryOnNetworkError(instance, TIMEOUT);

  const ok = await instance.get('/flaky');
  assert.equal(ok.status, 200);
  assert.equal(hits, 2);

  hits = 0;
  await assert.rejects(instance.get('/dead'));
  assert.equal(hits, 2); // 두 번 다 실패하면 원래 오류를 낸다. 세 번째는 없다

  hits = 0;
  await assert.rejects(instance.post('/dead', {}));
  assert.equal(hits, 1); // 쓰기 요청은 다시 보내지 않는다

  server.close();
  console.log('retryUpstream.check: ok');
}

main();
