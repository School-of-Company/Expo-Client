export interface DynamicFormItem {
  title: string;
  formType:
    | 'SENTENCE'
    | 'CHECKBOX'
    | 'MULTIPLE'
    | 'DROPDOWN'
    | 'APPLICATIONPHONEOPTION';
  jsonData?: Record<string, string>;
  requiredStatus: boolean;
  otherJson: string | null;
  dynamicFormType?: string;
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
  answerJson: string;
  personalInformationStatus: boolean;
}

export type DynamicFormValues = {
  [key: string]: string | string[] | undefined;
};
