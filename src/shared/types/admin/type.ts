export interface ExpoItem extends Record<string, unknown> {
  id: string;
  coverImage: string;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}

/** GET /expo/valid 의 박람회별 폼·설문 생성 여부 */
export interface ExpoValid {
  expoId: string;
  preStandardFormCreatedStatus: boolean;
  siteStandardFormCreatedStatus: boolean;
  traineeFormCreatedStatus: boolean;
  standardSurveyCreatedStatus: boolean;
  traineeSurveyCreatedStatus: boolean;
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
}
