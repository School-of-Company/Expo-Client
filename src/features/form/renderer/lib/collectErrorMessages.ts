/**
 * react-hook-form 오류 객체에서 화면에 보일 문구만 모은다. 동행자처럼 배열·중첩 문항의 오류는
 * 바깥 객체에 message 가 없고 안쪽에 있어서, 바깥만 읽으면 문구 없는 항목(빈 점)이 생긴다.
 * 같은 문구는 한 번만 담는다
 */
export const collectErrorMessages = (errors: unknown): string[] => {
  const messages = new Set<string>();

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const { message } = node as { message?: unknown };
    if (typeof message === 'string' && message) {
      messages.add(message);
      return;
    }
    Object.entries(node).forEach(([key, child]) => {
      // ref 는 입력 요소(DOM)라 따라 들어가지 않는다
      if (key !== 'ref') visit(child);
    });
  };

  visit(errors);
  return Array.from(messages);
};
