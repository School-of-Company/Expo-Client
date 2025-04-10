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
}

export type ApplicationFormValues = {
  privacyConsent: boolean;
} & {
  [key: string]: string | string[] | boolean;
};

export type FormattedApplicationData = {
  trainingId?: string;
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  informationJson: string;
};

export interface BaseFormData {
  phoneNumber: string;
}

export interface ApplicationBaseData extends BaseFormData {
  name: string;
  personalInformationStatus: boolean;
  informationJson: string;
}

export interface TraineeApplicationData extends ApplicationBaseData {
  trainingId: string;
}

export interface StandardApplicationData extends ApplicationBaseData {
  affiliation: string;
  schoolLevel: string;
  schoolDetail: string;
}

export interface SurveyData extends BaseFormData {
  answerJson: string;
}

export interface ApplicationForm {
  dynamicForm?: DynamicFormItem[];
  dynamicSurveyResponseDto?: DynamicFormItem[];
}

export type DynamicFormValues = {
  [key: string]: string | string[] | undefined;
};
