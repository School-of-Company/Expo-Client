import { ExpoMemberRole } from '../exhibition/member/type';

export interface ExpoItem extends Record<string, unknown> {
  id: string;
  // 대표 이미지가 없는 박람회는 null 이다
  coverImage: string | null;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  // 이 박람회에서 내 운영진 역할. 역할 판정을 켜기 전이거나 최고 관리자가 소속 없이 보면 null 이다
  myRole?: ExpoMemberRole | null;
}

/** GET /expo/valid 의 박람회별 폼·설문 생성 여부 */
export interface ExpoValid {
  expoId: string;
  preStandardFormCreatedStatus: boolean;
  siteStandardFormCreatedStatus: boolean;
  traineeFormCreatedStatus: boolean;
  standardSurveyCreatedStatus: boolean;
  traineeSurveyCreatedStatus: boolean;
  // GET /expo 의 myRole 과 같다
  myRole?: ExpoMemberRole | null;
}

export interface SignUpItem extends Record<string, unknown> {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string;
}
export interface AdminData {
  name: string;
  nickname: string;
  email: string;
  // 최고 관리자. 가입 승인을 맡고 모든 박람회에 들어간다. 예전 서버는 주지 않는다
  superAdmin?: boolean;
}
