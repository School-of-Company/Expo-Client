import { ApplicationType } from '../exhibition/type';
import { DynamicFormType } from '../form/create/type';
import type {
  Companion,
  FormType,
  JsonData,
  OtherJson,
} from '@/entities/form/model/types';
import type { SurveyAnswers } from '@/entities/survey/model/types';

// 과도기: 정본은 entities/form·entities/survey. 기존 import를 깨지 않으려고 다시 내보낸다.
export type { Companion, JsonData, OtherJson, SurveyAnswers };

export interface DynamicFormItem {
  id: number;
  title: string;
  formType: FormType;
  jsonData: JsonData;
  requiredStatus: boolean;
  otherJson: OtherJson | null;
  /** 폼에만 있다. 설문 문항에는 없다. */
  dynamicFormType?: DynamicFormType | 'DEFAULT';
}

/** 폼(FormResponseDto)과 설문(SurveyResponseDto)을 함께 담는 화면용 모양. */
export interface ApplicationForm {
  id?: string;
  expoId?: string;
  applicationType?: ApplicationType;
  title: string;
  informationText: string;
  startDate: string;
  endDate: string;
  participantType: 'STANDARD' | 'TRAINEE';
  dynamicForm?: DynamicFormItem[];
  dynamicSurveyResponseDto?: DynamicFormItem[];
}

export type ApplicationFormValues = {
  privacyConsent: boolean;
} & {
  [key: string]: string | string[] | boolean;
};

export type FormattedApplicationData = {
  informationJson: string;
  /** 사전등록에서 고른 회차. 신청 서비스가 정원을 이 회차 기준으로 판정한다. */
  sessionId?: string;
  personalInformationStatus?: boolean;
  name?: string;
  phoneNumber?: string;
  trainingId?: string;
};

export interface FormattedSurveyData {
  phoneNumber: string;
  personalInformationStatus: boolean;
  answers: SurveyAnswers;
}

export type DynamicFormValues = {
  [key: string]: string | string[] | boolean | Companion[] | undefined;
};

/** `GET /forms/{expoId}` 응답. 문항 스펙(`dynamicForm`)까지 담긴다. */
export interface FormResponseDto {
  id: string;
  expoId: string;
  title: string;
  informationText: string;
  participantType: 'STANDARD' | 'TRAINEE';
  applicationType: ApplicationType;
  startDate: string;
  endDate: string;
  dynamicForm: DynamicFormItem[];
}
