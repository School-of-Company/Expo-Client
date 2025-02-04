export interface DynamicFormItem {
  title: string;
  formType: 'SENTENCE' | 'CHECKBOX' | 'MULTIPLE' | 'DROPDOWN';
  jsonData: string;
  requiredStatus: boolean;
  otherJson: null | string;
}

export interface ApplicationForm {
  informationImage: string;
  participantType: 'STANDARD' | 'TRAINEE';
  dynamicForm: DynamicFormItem[];
}

export type ApplicationFormValues = {
  [key: string]: string | string[];
};

export type FormattedApplicationData = {
  trainingId?: string;
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  informationJson: string;
};
