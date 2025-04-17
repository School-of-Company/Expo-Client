export interface DynamicFormItem {
  title: string;
  formType: 'SENTENCE' | 'CHECKBOX' | 'MULTIPLE' | 'DROPDOWN';
  jsonData?: Record<string, string>;
  requiredStatus: boolean;
  otherJson: string | null;
}

export interface ApplicationForm {
  informationImage: string;
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
  name: string;
  phoneNumber: string;
  informationJson: string;
  trainingId?: string;
};

export interface SurveyData {
  phoneNumber: string;
  answerJson: string;
}

export type DynamicFormValues = {
  [key: string]: string | string[] | undefined;
};
