// 입장 QR 값. 일반 참가자는 {participantId, code}, 연수자는 {traineeId, phoneNumber}
export interface QrScanData {
  traineeId?: number;
  participantId?: number;
  code?: string;
  phoneNumber?: string;
}
