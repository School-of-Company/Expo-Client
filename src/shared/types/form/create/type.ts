import { ReactNode } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ApplicationType } from '../../exhibition/type';

export interface Option {
  value: string;
  label?: string;
  icon?: ReactNode;
  isAlwaysSelected?: boolean;
}

export interface FormValues {
  questions: {
    title: string;
    formType: string;
    options: Option[];
    requiredStatus: boolean;
    otherJson: string | null;
  }[];
  informationText: string;
  title: string;
}

export interface ConditionalSettings {
  hasEtc: boolean;
  maxSelection?: number | null;
  conditional?: {
    parentIndex: number;
    triggerValue: string;
  };
}
export interface OptionProps {
  fields: { id: string; value: string; isAlwaysSelected?: boolean }[];
  remove: (index: number) => void;
  register: UseFormRegister<FormValues>;
  index: number;
  isCheckBox?: boolean;
}

export interface ApplicationFormRequest {
  startDate: string;
  endDate: string;
  applicationId: string;
  participantType: 'STANDARD' | 'TRAINEE';
  applicationType: ApplicationType;
  dynamicForm: {
    title: string;
    formType: string;
    jsonData: string;
    requiredStatus: boolean;
    otherJson: string | null;
  }[];
  informationText: string;
  title: string;
}

export interface SurveyFormRequest {
  startDate: string;
  endDate: string;
  participationType: 'STANDARD' | 'TRAINEE';
  dynamicSurveyRequestDto: {
    title: string;
    formType: string;
    jsonData: string;
    requiredStatus: boolean;
    otherJson: string | null;
  }[];
  informationText: string;
  title: string;
}

export type CreateFormRequest = ApplicationFormRequest | SurveyFormRequest;
