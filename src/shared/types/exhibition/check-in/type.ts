// 일반 참가자는 participantId + code, 연수자는 phoneNumber로 찾는다
export type AttendUserQrRequest =
  | { authority: string; participantId: number; code: string }
  | { authority: string; phoneNumber: string };

// 연수자 전원과 교사만 값이 있고 그 외는 null
export interface AttendUserBadge {
  name: string;
  school: string | null;
  // 입구 스캔이 읽는 QR 값(JSON 문자열). 그대로 QR로 그린다
  qrCode: string;
}

export interface AttendUserResponse {
  id: number;
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  participationType: 'STANDARD' | 'TRAINEE';
  badge: AttendUserBadge | null;
}
