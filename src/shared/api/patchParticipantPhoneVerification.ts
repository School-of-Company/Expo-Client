import { toApiError } from '../libs/http/apiError';
import clientTokenInstance from '../libs/http/clientTokenInstance';

export interface ParticipantPhoneVerificationSetting {
  participantPhoneVerificationRequired: boolean;
  participantPhoneVerificationRevision: number;
}

/** 박람회별 "참가자 휴대전화 본인 인증 필요" 설정을 바꾼다. 응답은 저장된 값과 revision 이다 */
export const patchParticipantPhoneVerification = async (
  expoId: string,
  required: boolean,
): Promise<ParticipantPhoneVerificationSetting> => {
  try {
    const { data } = await clientTokenInstance.patch(
      `/expo/${encodeURIComponent(expoId)}/participant-phone-verification`,
      { participantPhoneVerificationRequired: required },
    );
    return data;
  } catch (error) {
    throw toApiError(error, '참가자 본인 인증 설정을 저장하지 못했습니다.');
  }
};
