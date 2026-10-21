/** 세션 만료 시각(UTC, 오프셋 없음)을 한국 시각 시:분으로 보여 준다 */
export const formatExpiresAt = (expiresAt: string) =>
  new Date(`${expiresAt}Z`).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
