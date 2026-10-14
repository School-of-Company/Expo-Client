/**
 * 같은 내용의 제출은 같은 Idempotency-Key 를 쓰게 한다. 연타·네트워크 오류 뒤 재제출이
 * 새 키를 받으면 서버가 중복 신청으로 처리하지 못한다. 내용이 바뀌거나 reset() 하면 새 키를 만든다.
 */
export const createSubmissionKeys = (
  newKey: () => string = () => crypto.randomUUID(),
) => {
  let last: { payload: string; key: string } | null = null;
  return {
    keyFor(payload: string) {
      if (last?.payload !== payload) last = { payload, key: newKey() };
      return last.key;
    },
    reset() {
      last = null;
    },
  };
};
