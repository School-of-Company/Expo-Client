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

// 보호자 동반 필수 정책 (ProgramGuardianPolicyRequest). 학년은 학생 본인 폼의 문항·선택지 키로만 판정한다.
// 문항 제목·선택지 라벨로 추측하지 않는다
export interface ProgramGuardianPolicy {
  // 참조하는 프로그램 폼 버전
  formVersion: number;
  // 학교급 선택 문항 ID 와 초등학생 선택지의 jsonData 키
  schoolTypeQuestionId: number;
  elementarySchoolValue: string;
  // 보호자가 학교급 문항에서 고르는 선택지의 jsonData 키. 초등 선택지와 달라야 한다.
  // 이 필드가 생기기 전에 저장된 정책에는 없다
  guardianSchoolValue?: string;
  // 초등학생 선택 시 표시되는 필수 학년 문항 ID
  gradeQuestionId: number;
  // 학년 선택지 jsonData 키 → 학년(1~6). 6개가 일대일로 대응해야 한다
  gradeValues: Record<string, number>;
}

// 프로그램 모집 정책 (ProgramPolicyRequest, 조회 응답도 같은 클래스를 쓴다).
// Swagger에도 required 로 표시되듯 groupId 외에는 모두 필수다.
// null·키 누락·빈 직업 목록은 400 이다(Expo-Expo-Server ProgramPolicyRequest.kt).
// 일시는 UTC 오프셋이 있는 ISO 8601 이다
export interface ProgramPolicy {
  groupId: string | null;
  formId: string;
  allowedOccupations: ProgramOccupation[];
  capacity: number;
  waitingCapacity: number;
  applicationStartedAt: string;
  applicationEndedAt: string;
  cancelEndedAt: string;
  promotionEndedAt: string;
  closed: boolean;
  // 총정원 capacity 는 사전·현장 정원의 합이다(Expo-Expo-Server#123). 두 정원은 생략할 수 없고
  // 알 수 없는 필드는 400 이다
  preRegistrationCapacity: number;
  onsiteCapacity: number;
  // 이 회차의 초등 1~3학년 보호자 동반 필수 설정. null·생략이면 OFF 이고 기존 단건 신청이다(Expo-Expo-Server#125)
  guardianPolicy?: ProgramGuardianPolicy | null;
  // 현장 접수 기간(Expo-Expo-Server#137). 둘 다 있거나 둘 다 없어야 하고 시작이 종료보다 빨라야 한다.
  // 수정은 정책을 통째로 바꾸므로 빠뜨리면 기존 현장 접수 기간이 지워진다
  onsiteStartedAt?: string | null;
  onsiteEndedAt?: string | null;
  // 자동 승급 설정(Expo-Expo-Server#143). 둘 다 생략하면 promotionEndedAt 까지 자동 승급한다. 수정은 정책을 통째로
  // 바꾸므로 빠뜨리면 기존 설정이 지워진다. 대기 정원이 0 이면 보낼 수 없다
  autoPromotionEnabled?: boolean | null;
  autoPromotionEndedAt?: string | null;
}

// 프로그램 생성·수정 요청 공통 필드. 시각은 'yyyy-MM-dd HH:mm' 이다.
// policy가 null이면 수정 요청에서 기존 정책을 유지한다
export interface StandardProgramRequest {
  title: string;
  startedAt: string;
  endedAt: string;
  // 회차 장소(선택). 생략·null 이면 수정 때 기존 장소를 두고, 빈 문자열이면 지운다(Expo-Expo-Server#124)
  place?: string | null;
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
  // 회차 장소. 서버 반영 전(Expo-Expo-Server#124 대기)이거나 입력하지 않았으면 없거나 null 이다
  place?: string | null;
}

// 연수 프로그램만 연수 구분을 갖는다 (TrainingProgramResponse)
export interface TrainingProgramItem extends Program {
  category: TrainingCategory;
}
