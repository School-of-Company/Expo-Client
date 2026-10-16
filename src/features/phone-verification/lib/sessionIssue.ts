/** 참가자 세션 문제. required: 인증한 적 없음(SESSION_REQUIRED), expired: 인증이 만료됨(SESSION_EXPIRED) */
export type SessionIssue = 'required' | 'expired';

/**
 * 401 만 세션 문제로 본다. 5xx·네트워크 오류는 만료가 아니므로 undefined 를 돌려준다.
 * ApiError·ApplicationSubmitError 모두 status/code 를 가진다.
 */
export const getSessionIssue = (error: unknown): SessionIssue | undefined => {
  const { status, code } = (error ?? {}) as { status?: number; code?: string };
  if (status !== 401) return undefined;
  return code === 'SESSION_EXPIRED' ? 'expired' : 'required';
};

export const SESSION_ISSUE_MESSAGE: Record<SessionIssue, string> = {
  required: '본인 인증이 필요합니다. 인증하면 신청 내역을 확인할 수 있습니다.',
  expired: '인증이 만료되었습니다. 다시 인증하면 이어서 진행할 수 있습니다.',
};
