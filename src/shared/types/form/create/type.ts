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

/** 빌더가 고르는 특수 필드. 서버 값은 여기에 `DEFAULT`(일반 필드)가 더해진다. */
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
  /** 일반 사전등록의 그 외 유형 신청 시작. 생략하면 수정에서 기존 값을 유지하고, null 이면 해제한다 */
  occupationOpenAt?: string | null;
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
  /** PATCH는 통째로 교체한다. 수정할 때 빠지면 서버 기본값으로 돌아갈 수 있다. */
  lotteryEnabled?: boolean;
  lotteryNumbers?: number[];
}

export type CreateFormRequest = ApplicationFormRequest | SurveyFormRequest;
