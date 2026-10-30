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
}

// QUEUED: 출력 작업 저장, DUPLICATE: 같은 사람의 오늘 작업이 이미 있음. 실제 출력 완료를 뜻하지 않는다
export type BadgePrintRequestResult = 'QUEUED' | 'DUPLICATE';

// 최초 입장과 재입장. 서버 필드 이름은 Expo-Attendance-Server#148 에서 확정 전이라 없을 수 있다(없으면 최초 입장으로 본다)
export type EntryStatus = 'FIRST' | 'RE_ENTRY';

export interface EntryStatusFields {
  entryStatus?: EntryStatus;
  // 그날 최초 입장 시각. 재입장 응답에만 온다
  firstEnteredTime?: string;
}

export interface AttendUserResponse extends EntryStatusFields {
  id: number;
  name: string;
  // 번호 없이 등록한 동행자는 null
  phoneNumber: string | null;
  personalInformationStatus: boolean;
  // Swagger상 string(STANDARD·TRAINEE 등 유저 서비스 값). 모르는 값이 와도 받는다
  participationType: string;
  badge: AttendUserBadge | null;
  // 명찰 자동 출력 요청 결과(User 서버가 입장과 함께 저장). 대상이 아니거나 재입장·재시도면 null, 이전 서버는 없다
  badgePrint?: BadgePrintRequestResult | null;
}
