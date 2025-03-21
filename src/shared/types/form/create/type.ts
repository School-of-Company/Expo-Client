import { ReactNode } from 'react';
import { UseFormRegister } from 'react-hook-form';

export interface Option {
  value: string;
  label?: string;
  icon?: ReactNode;
}

export interface FormValues {
  questions: {
    title: string;
    formType: string;
    options: Option[];
    requiredStatus: boolean;
    otherJson: string | null;
  }[];
}
export interface OptionProps {
  fields: { id: string; value: string }[];
  remove: (index: number) => void;
  register: UseFormRegister<FormValues>;
  index: number;
  isCheckBox?: boolean;
}

export interface ApplicationFormRequest {
  participantType: 'STANDARD' | 'TRAINEE';
  dynamicForm: {
    title: string;
    formType: string;
    jsonData: string;
  }[];
  informationImage: string;
}

export interface SurveyFormRequest {
  participationType: 'STANDARD' | 'TRAINEE';
  dynamicSurveyRequestDto: {
    title: string;
    formType: string;
    jsonData: string;
    requiredStatus: boolean;
    otherJson: string | null;
  }[];
}

export type CreateFormRequest = ApplicationFormRequest | SurveyFormRequest;
