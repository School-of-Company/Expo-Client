import { QrScanData } from '@/shared/types/common/QrScanData';
import { ExitScanRequest } from '@/shared/types/exhibition/check-in/entry';

/**
 * 스캔한 QR 을 퇴장 요청으로 바꾼다. 서버는 셋 중 하나만 받는다(둘 이상이면 400).
 * 예전 일반 참가자 QR({participantId, phoneNumber})은 퇴장 API 가 받지 않아 null
 */
export const toExitRequest = ({
  token,
  participantId,
  code,
  traineeId,
}: QrScanData): ExitScanRequest | null => {
  if (token) return { token };
  if (participantId && code) return { participantId, code };
  // 연수자 QR 은 {traineeId, phoneNumber} 라 ID 만 보낸다
  if (traineeId) return { traineeId };
  return null;
};
