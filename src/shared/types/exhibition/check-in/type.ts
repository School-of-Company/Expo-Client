import { USER_AUTHORITY, toRoleAuthority } from '@/shared/config';

// Swagger ScanEntryReqDto.authority: ROLE_STANDARD | ROLE_TRAINEE
type StandardAuthority = ReturnType<
  typeof toRoleAuthority<typeof USER_AUTHORITY.STANDARD>
>;
type TraineeAuthority = ReturnType<
  typeof toRoleAuthority<typeof USER_AUTHORITY.TRAINEE>
>;

// 일반 참가자는 participantId + code(또는 예전 QR의 phoneNumber), 연수자는 서버가 phoneNumber를 꼭 요구한다
export type AttendUserQrRequest =
  | { authority: StandardAuthority; participantId: number; code: string }
  | { authority: StandardAuthority; phoneNumber: string }
  | { authority: TraineeAuthority; phoneNumber: string };

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
  // 번호 없이 등록한 동행자는 null
  phoneNumber: string | null;
  personalInformationStatus: boolean;
  // Swagger상 string(STANDARD·TRAINEE 등 유저 서비스 값). 모르는 값이 와도 받는다
  participationType: string;
  badge: AttendUserBadge | null;
}
