import { toRoleAuthority, USER_AUTHORITY } from '@/shared/config';
import { QrScanData } from '@/shared/types/common/QrScanData';
import { AttendUserQrRequest } from '@/shared/types/exhibition/check-in/type';

/** 스캔한 개인 QR 을 입장 요청으로 바꾼다. 종이 QR(token)은 따로 보내고, 형식이 맞지 않으면 null */
export const toAttendRequest = ({
  traineeId,
  participantId,
  code,
  phoneNumber,
}: QrScanData): AttendUserQrRequest | null => {
  if (traineeId && phoneNumber) {
    return {
      authority: toRoleAuthority(USER_AUTHORITY.TRAINEE),
      phoneNumber,
    };
  }
  if (participantId && code) {
    return {
      authority: toRoleAuthority(USER_AUTHORITY.STANDARD),
      participantId,
      code,
    };
  }
  // 예전 일반 참가자 QR({participantId, phoneNumber})은 서버가 번호로 찾는다
  if (participantId && phoneNumber) {
    return {
      authority: toRoleAuthority(USER_AUTHORITY.STANDARD),
      phoneNumber,
    };
  }
  return null;
};
