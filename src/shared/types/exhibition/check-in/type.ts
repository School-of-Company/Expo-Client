// 일반 참가자는 participantId + code, 연수자는 phoneNumber로 찾는다
export type AttendUserQrRequest =
  | { authority: string; participantId: number; code: string }
  | { authority: string; phoneNumber: string };

export interface AttendUserResponse {
  id: number;
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  participationType: 'STANDARD' | 'TRAINEE';
}
