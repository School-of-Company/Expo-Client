// 입장 QR 값. 일반 참가자는 {participantId, code}, 연수자는 {traineeId, phoneNumber}
// 현장 종이 QR은 JSON이 아닌 22자 토큰 문자열이라 {token}으로 담는다
export interface QrScanData {
  traineeId?: number;
  participantId?: number;
  code?: string;
  phoneNumber?: string;
  token?: string;
}
