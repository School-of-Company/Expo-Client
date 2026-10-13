// Expo 서버 OpenAPI의 프로그램 스키마를 한곳에 둔다.
// 박람회 생성·수정·상세와 사전등록 일정 화면이 모두 여기서 파생해 쓴다

export type ProgramType = 'STANDARD' | 'TRAINING';

export type TrainingCategory = 'ESSENTIAL' | 'CHOICE';

// 프로그램 신청 가능 직종 (ProgramPolicyRequest.allowedOccupations)
export type ProgramOccupation =
  | 'KINDERGARTEN_STUDENT'
  | 'ELEMENTARY_STUDENT'
  | 'MIDDLE_SCHOOL_STUDENT'
  | 'HIGH_SCHOOL_STUDENT'
  | 'SCHOOL_STAFF'
  | 'PARENT'
  | 'GENERAL'
  | 'TEACHER'
  | 'PRE_SERVICE_TEACHER';

// 프로그램 모집 정책 (ProgramPolicyRequest, 조회 응답도 같은 스키마를 쓴다).
// 스펙은 모든 필드가 선택이고 groupId만 null을 허용하지만, 일정 화면이 formId·일시를
// null로 비워 보내므로 더 느슨한 쪽에 맞춘다. 일시는 UTC 오프셋이 있는 ISO 8601 이다
export interface ProgramPolicy {
  groupId?: string | null;
  formId?: string | null;
  allowedOccupations?: ProgramOccupation[];
  capacity?: number;
  waitingCapacity?: number;
  applicationStartedAt?: string | null;
  applicationEndedAt?: string | null;
  cancelEndedAt?: string | null;
  promotionEndedAt?: string | null;
  closed?: boolean;
}

// 프로그램 생성·수정 요청 공통 필드. 시각은 'yyyy-MM-dd HH:mm' 이다.
// policy가 null이면 수정 요청에서 기존 정책을 유지한다
export interface StandardProgramRequest {
  title: string;
  startedAt: string;
  endedAt: string;
  policy?: ProgramPolicy | null;
}

export interface TrainingProgramRequest extends StandardProgramRequest {
  category: TrainingCategory;
}

// 프로그램 목록 조회 응답 (StandardProgramResponse). 시각은 ISO 지역 일시다
export interface Program {
  id: number;
  expoId: string | null;
  programType: ProgramType;
  groupId: string | null;
  // null 이면 정책이 없는 기존 프로그램이다
  policy: ProgramPolicy | null;
  // 조회한 정의 버전. 박람회 수정 요청에 그대로 돌려보낸다
  revision: number;
  // 중단된 변경이 남아 있으면 그 다음 버전, 없으면 null
  pendingRevision: number | null;
  title: string;
  startedAt: string;
  endedAt: string;
}

// 연수 프로그램만 연수 구분을 갖는다 (TrainingProgramResponse)
export interface TrainingProgramItem extends Program {
  category: TrainingCategory;
}
