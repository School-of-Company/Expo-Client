export interface AttendUserQrRequest {
  authority: string;
  phoneNumber: string;
}

export interface AttendUserResponse {
  id: number;
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  participationType: 'STANDARD' | 'TRAINEE';
}
