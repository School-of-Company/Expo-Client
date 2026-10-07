import { DynamicFormType } from '../form/create/type';

/** 선택지 맵. 키는 답변 값으로 쓰이고, 값은 보기 문구다. */
export type JsonData = Record<
  string,
  string | { value: string; isAlwaysSelected: boolean }
>;

export interface OtherJson {
  hasEtc: boolean;
  maxSelection?: number;
  /** `parentIndex`는 문항 목록 안의 위치(0부터). `triggerValue`와 `triggerValues` 중 하나만 온다. */
  conditional?: {
    parentIndex: number;
    triggerValue?: string;
    triggerValues?: string[];
  };
}

export interface DynamicFormItem {
  id: number;
  title: string;
  formType: 'SENTENCE' | 'CHECKBOX' | 'DROPDOWN' | 'IMAGE' | 'MULTIPLE';
  jsonData: JsonData;
  requiredStatus: boolean;
  otherJson: OtherJson | null;
  /** 폼에만 있다. 설문 문항에는 없다. */
  dynamicFormType?: DynamicFormType | 'DEFAULT';
}

export interface ApplicationForm {
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

/** 문항 id → 답변. SENTENCE 문자열, CHECKBOX boolean, DROPDOWN 키, MULTIPLE 키 배열. */
export type SurveyAnswers = Record<string, string | boolean | string[]>;

export type DynamicFormValues = {
  [key: string]: string | string[] | boolean | undefined;
};
