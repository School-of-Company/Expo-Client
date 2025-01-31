export interface DynamicFormItem {
  title: string;
  formType: 'SENTENCE' | 'CHECKBOX' | 'MULTIPLE' | 'DROPDOWN';
  jsonData: string;
}

export interface ApplicationForm {
  informationImage: string;
  participantType: 'STANDARD' | 'TRAINEE';
  dynamicForm: DynamicFormItem[];
}
