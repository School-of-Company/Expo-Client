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
  }[];
}
export interface OptionProps {
  fields: { id: string; value: string }[];
  remove: (index: number) => void;
  register: UseFormRegister<FormValues>;
  index: number;
  isCheckBox?: boolean;
}

export interface CreateFormRequest {
  informationImage: string;
  participantType: string;
  dynamicForm: {
    title: string;
    formType: string;
    jsonData: string;
  }[];
}
