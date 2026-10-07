import { ReactNode } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { DynamicFormItem, JsonData, OtherJson } from '../../application/type';
import { ApplicationType } from '../../exhibition/type';

export interface Option {
  id?: string;
  value: string;
  label?: string;
  icon?: ReactNode;
  isAlwaysSelected?: boolean;
  /** 서버 `jsonData` 키. 없으면 순서(1부터)로 매긴다. 직업처럼 키가 고정된 선택지만 둔다. */
  key?: string;
}

export type DynamicFormType =
  | 'NAME'
  | 'PHONE_NUMBER'
  | 'TRAINING_ID'
  | 'OCCUPATION'
  | 'SCHOOL';

export interface FormValues {
  questions: {
    id?: string;
    title: string;
    formType: string;
    options: Option[];
    requiredStatus: boolean;
    otherJson: string | null;
    dynamicFormType?: DynamicFormType | 'DEFAULT';
  }[];
  informationText: string;
  title: string;
}

/** 빌더 내부 `otherJson`(문자열)의 모양. 서버 모양으로는 `formUtils`에서 바꾼다. */
export interface ConditionalSettings {
  maxSelection?: number | null;
  conditional?: {
    parentId: string;
    triggerValue?: string | null;
    triggerValues?: string[];
  };
}
export interface OptionProps {
  fields: { id: string; value: string; isAlwaysSelected?: boolean }[];
  remove: (index: number) => void;
  register: UseFormRegister<FormValues>;
  index: number;
}

export interface DynamicFieldRequest {
  title: string;
  formType: DynamicFormItem['formType'];
  jsonData: JsonData;
  requiredStatus: boolean;
  otherJson: OtherJson | null;
}

export interface ApplicationFormRequest {
  startDate: string;
  endDate: string;
  participantType: 'STANDARD' | 'TRAINEE';
  applicationType: ApplicationType;
  dynamicForm: (DynamicFieldRequest & {
    dynamicFormType: DynamicFormType | 'DEFAULT';
  })[];
  informationText: string;
  title: string;
}

export interface SurveyFormRequest {
  participationType: 'STANDARD' | 'TRAINEE';
  dynamicSurveyRequestDto: DynamicFieldRequest[];
  informationText: string;
  title: string;
}

export type CreateFormRequest = ApplicationFormRequest | SurveyFormRequest;
