// `/application/{expoId}`, `/application/forms/{expoId}/...`
const APPLICATION_PATH = /^\/application\/(?:forms\/)?([^/?#]+)/;
// `/application/` 바로 아래에 오는 박람회 ID가 아닌 경로 조각
const NON_EXPO_SEGMENTS = new Set(['forms', 'success']);

/**
 * 인증할 박람회 ID. `?expoId=` 를 쓰고, 없으면 돌아갈 신청 화면 경로에서 꺼낸다.
 * 참가자 인증 API는 박람회별로 세션을 발급하므로 박람회 ID 없이는 인증할 수 없다.
 */
export const getExpoId = (
  expoId: string | null,
  redirect: string | null,
): string | null => {
  if (expoId) return expoId;
  const matched = redirect?.match(APPLICATION_PATH)?.[1];
  if (!matched || NON_EXPO_SEGMENTS.has(matched)) return null;
  return decodeURIComponent(matched);
};
